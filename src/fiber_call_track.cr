class Fiber
  enum TrackingType
    Measure
    Blocking
    Idle
  end

  class CallMeasure
    @start_time = uninitialized Time::Span
    @t_type = TrackingType::Measure

    def measure(meth_name, name, @t_type)
      @start_time = Time.monotonic
      yield
      elapsed = Time.monotonic - @start_time
      puts "#{meth_name} #{name} #{elapsed}"
    end
  end

  private getter measuring : Array(CallMeasure) do
    Array(CallMeasure).new
  end
  @measuring_idx = -1

  macro measure(name = nil)
    Fiber.current.measure_internal "{{"#{@type.name.id}.#{@def.name.id}".id}}", {{name}}, Fiber::TrackingType::Measure do
      {{ yield }}
    end
  end

  macro measure_idle(name = nil)
    Fiber.current.measure_internal "{{"#{@type.name.id}.#{@def.name.id}".id}}", {{name}}, Fiber::TrackingType::Idle do
      {{ yield }}
    end
  end

  def measure_internal(meth_name : String, name : Symbol | String | Nil, t_type)
    ma = measuring
    mi = @measuring_idx
    cm = if mi >= ma.size
           ma[mi]
         else
           m = CallMeasure.new
           ma << m
           m
         end
    @measuring_idx = mi + 1

    cm.measure(meth_name, name, t_type) do
      yield
    end
  end
end
