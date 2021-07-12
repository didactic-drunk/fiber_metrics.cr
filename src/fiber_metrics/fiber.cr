class Fiber
  alias NameSummaryT = Hash(String|Symbol|Nil, CallTrack)
  alias MethodSummaryT = Hash(String, NameSummaryT)

  @@msummary = MethodSummaryT.new do |h, k|
    h[k] = NameSummaryT.new do |h2, k2|
      h2[k2] = CallTrack.new.tap { |cm| cm.t_type = TrackingType::Sum }
    end
  end

  private getter measure_data : Tuple(Array(CallTrack), MethodSummaryT) do
    stack = Array(CallTrack).new.tap do |ma|
      # Sum of entire Fiber
      ma << CallTrack.new.tap { |cm| cm.t_type = TrackingType::Sum }
      ma << CallTrack.new
    end

    msummary = MethodSummaryT.new do |h, k|
      h[k] = NameSummaryT.new
    end

    {stack, msummary}
  end
  @measuring_idx = 0

  @[Experimental]
  macro measure(name = nil)
    Fiber.current.measure_internal \{{"#{@type.name.id}.#{@def.name.id}"}}, {{name}}, Fiber::TrackingType::Measure do
      {{ yield }}
    end
  end

  @[Experimental]
  macro measure_idle(name = nil)
    Fiber.current.measure_internal \{{"#{@type.name.id}.#{@def.name.id}"}}, {{name}}, Fiber::TrackingType::Idle do
      {{ yield }}
    end
  end

  @[Experimental]
  macro measure_blocking(name = nil)
    Fiber.current.measure_internal \{{"#{@type.name.id}.#{@def.name.id}"}}, {{name}}, Fiber::TrackingType::Blocking do
      {{ yield }}
    end
  end

  @@stats_debug = false
  # :nodoc:
  def self.stats_debug=(val)
    @@stats_debug = val
  end

  @cur_call_track = CallTrack.new

  {% for field in %w(measure idle blocking) %}
    # :nodoc:
    # Only measure if already measuring this Fiber
    def maybe_measure_{{field.id}}
      return yield unless @measuring_idx > 0

      measure_start = Time.monotonic
      begin
          yield
      ensure
        @cur_call_track.{{field.id}} += Time.monotonic - measure_start
      end
    end
  {% end %}

  # :nodoc:
  def measure_internal(meth_name : String, name : String?, t_type : TrackingType)
    stack, msummary = measure_data
    mi = @measuring_idx += 1
    if @@stats_debug
      self.to_s(STDOUT)
      STDOUT << " enter mi=" << @measuring_idx << " 1 ssize=" << stack.size <<  "\n"
    end
    cm = stack[mi]
    # Keep one additional CallTrack on end to alloc malloc tracking of CallTrack.new
    stack << CallTrack.new unless stack.size > mi + 1

    # save prev on stack
    stack[mi - 1] = @cur_call_track
    @cur_call_track = CallTrack.new
  @cur_call_track.info meth_name, name

    start_measure = Time.monotonic
    begin
        yield
    ensure
      elapsed = Time.monotonic - start_measure

      @cur_call_track.add_rt elapsed
      @measuring_idx -= 1
      methsum = msummary[meth_name][name] ||= CallTrack.new.info(meth_name, name)
      methsum.calls += 1
      msummary[meth_name][name] = methsum.add_from @cur_call_track

      if mi == 1 # spawn exit is unpredictable.  store stats here
        aggregate_stats
      end

      @cur_call_track = stack[mi - 1].add_child @cur_call_track
    end
  end

  # :nodoc:
  # Can't allocate memory in this method
  def track_malloc(size) : Nil
    return if @measuring_idx == 0

    @cur_call_track.mem += size
  end

  # :nodoc:
  protected def aggregate_stats
    if stack_msummary = @measure_data
      msum = stack_msummary.last
      MSUMMARY_MUTEX.synchronize do
        msum.each do |mkey, nsum|
          nsummary = @@msummary[mkey]
          nsum.each do |nkey, calls|
            nsummary[nkey] = nsummary[nkey].add_from calls
          end
          nsum.clear
        end
      end
    end
  end

  private MSUMMARY_MUTEX = Mutex.new

  @[Experimental]
  def self.stats
    hash = Hash(String, CallTrack).new
    MSUMMARY_MUTEX.synchronize do
      @@msummary.each do |mkey, nsum|
          nsum.each do |nkey, calls|
            # FEATURE: String cache
            k = nkey ? "#{mkey},#{nkey}" : mkey
            hash[k] = calls
          end
      end
    end
    hash
  end

  private FFMT = "%8.3f"
  private IFMT = "%8d"

  @[Experimental]
  def self.print_stats(io = STDOUT) : Nil
    puts "Stats:"

    key_size_max = 0
    stats.to_a.sort_by { |key, nsum|
      key_size_max = Math.max(key.bytesize, key_size_max)
      nsum.rt
    }.reverse.each do |key, nsum|
      io << key
      pad(io, key_size_max + 1 - key.bytesize)

      print_val(io, "tt:", " ", FFMT, 8, nsum.tt)
      print_val(io, "rt:", " ", FFMT, 8, nsum.rt)
      print_val(io, "idle:", " ", FFMT, 8, nsum.idle)
      print_val(io, "blkd:", " ", FFMT, 8, nsum.blocking)
      print_val(io, "calls:", " ", IFMT, 8, nsum.calls)
      print_val(io, "mem:", "K ", IFMT, 8, nsum.mem/1024)

      io << "\n"
    end
  end

  private def self.print_val(io : IO, prefix : String, suffix : String?, fmt : String, maxlen, val) : Nil
    val = case val
      when Time::Span
        val.to_f
      else
        val
    end

    if val > 0.0
      io << prefix
      io << (fmt % val)
      io << suffix
    else
      pad io, (prefix.bytesize + (suffix.try(&.bytesize) || 0) + maxlen)
    end
  end

  private def self.pad(io, n)
    n.times { io << " " }
  end
end
