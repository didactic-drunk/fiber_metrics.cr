require "./spec_helper"

class C
#  include Fiber::Stats

  @fiber_stats = Fiber::Stats::MapT.new

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
    return if n == 0

    Fiber.measure :recursive do
      Fiber.measure_idle :sleep do
        sleep 0.02
      end

      sleep 0.01
      recur (n - 1)
    end
  end
end

describe Fiber do
  it "works" do
    Fiber.current.name = "c"
    c = C.new
    c.run

    c.recur 3
  end
end
