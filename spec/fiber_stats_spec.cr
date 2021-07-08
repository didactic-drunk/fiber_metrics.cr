require "./spec_helper"

STDOUT.sync = true

class C
  def run
    Fiber.measure(:run) do
      sleep 0.01
      Fiber.measure_idle :sleep do
        sleep 0.07
        puts "sleep exit"
      end
    end
  end

  def recur(n)
    if n == 0
      return
    end

    Fiber.measure do
      puts "bytes"
      1.times do
        ary = Array(Int32).new 1024
      end
      sleep 0.1
      Fiber.measure_idle :sleep do
        sleep 0.1
        recur (n - 1)
        sleep 0.1
      end
      sleep 0.1
    end
  end
end


describe Fiber do
  it "works" do
    Fiber.current.name = "c"

#    Fiber.stats_debug = true

    ch = Channel(Nil).new
    c = C.new

    fibers = 1
    depth = 2

    elapsed = Time.measure do
      fibers.times do
        spawn do
          Fiber.current.name = "spec"
          c.recur depth
          ch.send nil
        end
      end
      fibers.times do
        ch.receive
      end
    end.to_f

    approx_elapsed = (elapsed * 0.9)..(elapsed * 1.1)

#    Fiber.stats_debug = false
#    pp Fiber.current.@measure_data.not_nil![0]
 #   pp Fiber.current.@measure_data.not_nil![1]

    time_delta = 0.9
    Fiber.stats.each_with_index do |(_, c), i|
      c.calls.should eq (fibers * depth)

      if i == 1
        # Only check the minimum.  Arrays & Fibers allocate memory too
        (c.mem//1024).should be > ((4096 * fibers * depth) // 1024)
        c.tt.to_f.should be_close(elapsed, time_delta)
        c.rt.to_f.should be_close(elapsed/2, time_delta)
        c.idle.to_f.should be_close(elapsed/2, time_delta)
        c.blocking.to_f.should be_close(0, time_delta)
      end
    end

    Fiber.print_stats
  end
end
