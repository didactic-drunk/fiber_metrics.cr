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
      ary = Array(Int32).new
      1000.times { ary << 0 }
      2.times { Bytes.new 8192 }
      2.times { GC.malloc_atomic 1024 }
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

    Fiber.stats_debug = true

    ch = Channel(Nil).new
    c = C.new
#    c.run

    fibers = 1
    depth = 1

    fibers.times do
      spawn do
        c.recur depth
        ch.send nil
      end
    end
    fibers.times do
      ch.receive
    end

    Fiber.stats_debug = false
#    pp Fiber.current.@measure_data.not_nil![0]
 #   pp Fiber.current.@measure_data.not_nil![1]

    Fiber.stats.each do |_, c|
#p c
      c.calls.should eq (fibers * depth)
    end

    Fiber.print_stats
  end
end
