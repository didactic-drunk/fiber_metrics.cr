require "./spec_helper"

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

    ch = Channel(Nil).new
    c = C.new
#    c.run

    fibers = 4
    depth = 4

    fibers.times do
      spawn do
        c.recur depth
        ch.send nil
      end
    end
    fibers.times do
      ch.receive
    end

    Fiber.yield

#    pp Fiber.current.@measure_data.not_nil![0]
 #   pp Fiber.current.@measure_data.not_nil![1]

    Fiber.stats.each do |_, c|
#p c
      c.calls.should eq (fibers * depth)
    end

    Fiber.print_stats
  end
end
