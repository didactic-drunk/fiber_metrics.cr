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
  class CallTrack
    property mem = 0_u64
    property tt = Time::Span.new
    property rt = Time::Span.new
    property idle = Time::Span.new
    property blocking = Time::Span.new
    property calls = 0_u64
    @start_time = uninitialized Time::Span
    property t_type = TrackingType::Measure
    # BUG: temp debugging
    @mi = 0

    def measure(meth_name, name, @t_type, prev : self, @mi)
      init
      yield
    ensure
      elapsed = Time.monotonic - @start_time

      _tt = tt + elapsed
      _idle = idle
      _blocking = blocking
      _rt = rt

      elapsed -= _rt + _idle + _blocking

      case @t_type
        in TrackingType::Measure
          _rt += elapsed
        in TrackingType::Idle
          _idle += elapsed
        in TrackingType::Blocking
          _blocking += elapsed
        in TrackingType::Unused, TrackingType::Sum
          abort "impossible condition #{self}"
      end

      @tt = _tt
      @rt = _rt
      @idle = _idle
      @blocking = _blocking

      prev.add_from self
#      @t_type = TrackingType::Unused

#      puts "#{meth_name} #{name} #{elapsed}"
    end

    def track_malloc(size, mi, debug)
      @mem += size
      STDOUT << @t_type.to_s << " mi=" << mi << " size=" << size << "\n" if debug
    end

    def track_realloc(ptr, size)
      # BUG: sub old allocate size
      @mem += size
    end

    def add_from(other : self)
      @mem += other.mem
      @tt += other.tt if @t_type == TrackingType::Sum
      @rt += other.rt
      @idle += other.idle
      @blocking += other.blocking
      @calls += other.calls
    end

    private def init
      @start_time = Time.monotonic
      reset
    end

    def reset
      @mem = 0_u64
      @tt = Time::Span.new
      @rt = Time::Span.new
      @idle = Time::Span.new
      @blocked = Time::Span.new
      @calls = 0_u64
    end
  end
end
