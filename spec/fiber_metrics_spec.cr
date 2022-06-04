require "./spec_helper"

Colorize.enabled = true
STDOUT.sync = true

SLEEP_TIME = 0.1

class C
  include Fiber::Metrics

  MUTEX = Mutex.new

  @[Measure]
  def run
    Fiber.measure(:run) do
      sleep 0.01
      Fiber.measure_idle :sleep do
        sleep 0.07
        puts "sleep exit"
      end
    end
  end

  @[Measure]
  def foo(ch)
    # Ignore overhead of first tracked call
    Fiber.current.@cur_call_track.mem = 0_u64
    sleep SLEEP_TIME
    bar ch
    Bytes.new 4096
  end

  @[Measure]
  def bar(ch)
    sleep SLEEP_TIME
    baz ch
    Bytes.new 8192
  end

  @[Measure]
  def baz(ch)
    sleep SLEEP_TIME
    ch.send nil
    MUTEX.synchronize do
      Bytes.new 16384
    end
  end


  @[Measure]
  def recur(n, &block)
    if n == 0
      Fiber.measure :yield do
        return yield
      end
    end

    1.times do
      ary = Array(Int32).new 1024
    end
    sleep SLEEP_TIME
    Fiber.measure_idle :sleep do
      sleep SLEEP_TIME
      recur (n - 1), &block
      sleep SLEEP_TIME
    end
    sleep SLEEP_TIME
  end
end


describe Fiber do
  it "works" do
    Fiber.current.name = "spec"

    puts ""
#    Fiber.stats_debug = true

    fibers = 1
    iter = 4

    blocked_sleep_time = SLEEP_TIME * 4
    blocked_time = SLEEP_TIME

    ch = Channel(Nil).new fibers
    blocked_ch = Channel(Nil).new
    c = C.new

    elapsed1 = Time.measure do
      fibers.times do
        spawn do
          Fiber.current.name = "fiber_spec"
          iter.times do
            c.foo blocked_ch
            ch.send nil
          end
        end
      end
    end.to_f
    elapsed2 = Time.measure do
      iter.times do
        sleep blocked_sleep_time - elapsed1.to_f / 2
        fibers.times { blocked_ch.receive }
        fibers.times { ch.receive }
      end
    end.to_f

    elapsed = elapsed1 + elapsed2

    Fiber.stats_debug = false

    puts ""
    Fiber.print_stats


    stats = Fiber.stats
    stats.size.should eq 3

    time_delta = elapsed * 0.2
    stats.each do |name, c|
      case name
        when "C.foo"
          c.tt.to_f.should be_close(fibers * iter * 4 * SLEEP_TIME, time_delta)
          c.blocking.to_f.should be_close(0, 0)
          (c.mem//1024).should be_close(fibers * iter * 4, fibers * 1)
        when "C.bar"
          c.tt.to_f.should be_close(fibers * iter * 3 * SLEEP_TIME, time_delta)
          c.blocking.to_f.should be_close(0, 0)
          (c.mem//1024).should be_close(fibers * iter * 8, fibers * 1)
        when "C.baz"
          c.tt.to_f.should be_close(fibers * iter * 2 * SLEEP_TIME, time_delta)
          c.blocking.to_f.should be_close(fibers * iter * blocked_time, time_delta)
          (c.mem//1024).should be_close(fibers * iter * 16, fibers * 1)
        else
          raise "unknown name #{name}"
      end

      c.rt.to_f.should be_close(fibers * iter * 1 * SLEEP_TIME, time_delta)
      c.calls.should eq (fibers * iter)
    end
  end

  pending "recur" do
    Fiber.current.name = "c"

    puts ""
    Fiber.stats_debug = true

    fibers = 1
    depth = 2 # Number of method call is depth+1.  +1 yields outside of other blocks

    ch = Channel(Nil).new fibers
    blocked_ch = Channel(Nil).new
    c = C.new


    # sleep half_number_of_other_sleeps + 1 to check blocked works
    blocked_sleep_time = SLEEP_TIME * ((depth*2)+1)
    blocked_time = SLEEP_TIME

    elapsed = Time.measure do
      fibers.times do
        spawn do
          Fiber.current.name = "spec"
          c.recur depth do
            blocked_ch.send nil
          end
          ch.send nil
        end
      end

      sleep blocked_sleep_time
      fibers.times { blocked_ch.receive }

      fibers.times { ch.receive }
    end.to_f

p elapsed

    Fiber.stats_debug = false

    puts ""
    Fiber.print_stats


    stats = Fiber.stats
    stats.size.should eq 3

    time_delta = elapsed * 0.1
    stats.each do |name, c|
      case name
        when "C.recur"
          c.calls.should eq (fibers * (depth + 1))

          # Only check the minimum.  Arrays & Fibers allocate memory too
          (c.mem//1024).should be > ((4096 * fibers * depth) // 1024)
#          c.tt.to_f.should be_close(elapsed, time_delta)
#          c.rt.to_f.should be_close(elapsed/2, time_delta/2)
#          c.idle.to_f.should be_close(elapsed/2, time_delta/2)
        when "C.recur,sleep"
          c.calls.should eq (fibers * depth)

        when "C.recur,yield"
          c.calls.should eq (fibers)

          (c.mem//1024).should be_close(0, 100)
        else
          raise "unknown name #{name}"
      end

      c.blocking.to_f.should be_close(blocked_time, blocked_time * 0.1)
    end

  end
end
