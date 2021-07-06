class Fiber
  enum TrackingType
    Measure
    Blocking
    Idle
  end

  class CallMeasure
    property tt = Time::Span.new
    property rt = Time::Span.new
    @idle = uninitialized Time::Span
    @blocking = uninitialized Time::Span
    @start_time = uninitialized Time::Span
    @t_type = TrackingType::Measure

    def measure(meth_name, name, @t_type, prev : CallMeasure)
      reset
      yield
    ensure
      elapsed = Time.monotonic - @start_time

      case @t_type
        in TrackingType::Measure
          prev.rt += elapsed
        in TrackingType::Blocking
#          @rt += elapsed
        in TrackingType::Idle
      end
      puts "#{meth_name} #{name} #{elapsed}"
    end

    private def reset
      @tt = Time::Span.new
      @start_time = Time.monotonic
    end
  end

  private getter measuring : Array(CallMeasure) do
    Array(CallMeasure).new.tap do |ma|
      ma << CallMeasure.new
      ma << CallMeasure.new
    end
  end
  @measuring_idx = 1

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
    prev = ma[mi - 1]
    begin
      puts "enter mi=#{@measuring_idx} #{name} #{cm}"
      cm.measure(meth_name, name, t_type, prev) do
        yield
      end
    ensure
      @measuring_idx -= 1
      puts "exit mi=#{@measuring_idx} #{name} #{cm}"
    end
  end
end
