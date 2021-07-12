class Fiber
  # :nodoc:
  enum TrackingType
    Unused
    Sum
    Measure
    Blocking
    Idle
  end

  # :nodoc:
  struct CallTrack
    property mem = 0_u64
    property tt = Time::Span.new
    property rt = Time::Span.new
    # Time spent in other methods
    property ot = Time::Span.new
    property idle = Time::Span.new
    property blocking = Time::Span.new
    property calls = 0_u64
    @start_time = uninitialized Time::Span
    property t_type = TrackingType::Measure
    property meth_name : String = "UNSPECIFIED_METHOD"
    property name : String | Symbol | Nil = nil

    def info(@meth_name, @name) : self
      self
    end

    def add_rt(elapsed) : Nil
      @tt += elapsed
      @rt += elapsed - @idle - blocking
    end

    def add_child(other : self) : self
      @ot += other.rt + other.idle + other.blocking
      @rt -= other.rt + other.ot + other.idle + other.blocking
      self
    end

    def add_from(other : self) : self
      @mem += other.mem
      @tt += other.tt
      @rt += other.rt
      @idle += other.idle
      @blocking += other.blocking
      @calls += other.calls
      self
    end

    private def init
      @start_time = Time.monotonic
      reset
    end

    def reset
      @mem = 0_u64
      @tt = Time::Span.new
      @rt = Time::Span.new
      @ot = Time::Span.new
      @idle = Time::Span.new
      @blocking = Time::Span.new
      @calls = 0_u64
    end
  end
end
