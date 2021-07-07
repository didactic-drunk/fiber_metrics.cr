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
      h[k] = NameSummaryT.new do |h2, k2|
        h2[k2] = CallTrack.new.tap { |cm| cm.t_type = TrackingType::Sum }
      end
    end

    {stack, msummary}
  end
  @measuring_idx = 0

  macro measure(name = nil)
    Fiber.current.measure_internal \{{"#{@type.name.id}.#{@def.name.id}"}}, {{name}}, Fiber::TrackingType::Measure do
      {{ yield }}
    end
  end

  macro measure_idle(name = nil)
    Fiber.current.measure_internal \{{"#{@type.name.id}.#{@def.name.id}"}}, {{name}}, Fiber::TrackingType::Idle do
      {{ yield }}
    end
  end

  macro measure_blocking(name = nil)
    Fiber.current.measure_internal \{{"#{@type.name.id}.#{@def.name.id}"}}, {{name}}, Fiber::TrackingType::Blocking do
      {{ yield }}
    end
  end

  macro measure_method(sym)
  end

  # :nodoc:
  def measure_internal(meth_name : String, name : Symbol | String | Nil, t_type)
    stack, msummary = measure_data
    mi = @measuring_idx += 1
    cm = if mi < stack.size
           stack[mi]
         else
           m = CallTrack.new
           stack << m
           m
         end
    prev = stack[mi - 1]

    begin
if true
#if false
#      puts "enter mi=#{@measuring_idx} #{name}"
      puts "enter"
#puts "enter mi=#{@measuring_idx}"
#      puts "\t#{cm.inspect}"
#      puts "\t#{prev.inspect}"
end
      cm.measure(meth_name, name, t_type, prev, mi) do
        yield
      end
    ensure
      @measuring_idx -= 1
      methsum = msummary[meth_name][name]
      methsum.add_from cm
      methsum.calls += 1

      if mi == 1 # spawn exit is unpredictable.  store stats here
        aggregate_stats
      end

if false
      puts "exit mi=#{@measuring_idx} #{name}"
      puts "\t#{cm.inspect}"
      puts "\t#{prev.inspect}"
end
    end
  end

  # :nodoc:
  def track_malloc(size) : Nil
    stack, msummary = measure_data
    calls = stack[@measuring_idx]
STDOUT << "track_malloc mi=" << @measuring_idx << " size=" << size << "\n"
    calls.track_malloc size
  end

  # :nodoc:
  def track_realloc(ptr, size) : Nil
    stack, msummary = measure_data
    calls = stack[@measuring_idx]
    calls.track_realloc ptr, size
  end

  # :nodoc:
  protected def aggregate_stats
    if stack_msummary = @measure_data
      msum = stack_msummary[1]
      MSUMMARY_MUTEX.synchronize do
        msum.each do |mkey, nsum|
          nsummary = @@msummary[mkey]
          nsum.each do |nkey, calls|
            nsummary[nkey].add_from calls
            calls.reset
          end
        end
      end
    end
  end

  private MSUMMARY_MUTEX = Mutex.new

  def self.stats
    hash = Hash(String, CallTrack).new
    MSUMMARY_MUTEX.synchronize do
      @@msummary.each do |mkey, nsum|
          nsum.each do |nkey, calls|
            # FEATURE: string cache
            hash["#{mkey},#{nkey}"] = calls
          end
      end
    end
    hash
  end

  private FFMT = "%8.3f"
  private IFMT = "%7d"

  def self.print_stats(io = STDOUT) : Nil
    key_size_max = 0
    stats.to_a.sort_by { |key, nsum|
      key_size_max = Math.max(key.bytesize, key_size_max)
      nsum.rt
    }.reverse.each do |key, nsum|
      io << key
      pad(io, key_size_max + 1 - key.bytesize)

      print_val(io, "tt:", " ", FFMT, 12, nsum.tt)
      print_val(io, "rt:", " ", FFMT, 12, nsum.rt)
      print_val(io, "idle:", " ", FFMT, 12, nsum.idle)
      print_val(io, "blkd:", " ", FFMT, 12, nsum.blocking)
      print_val(io, "calls:", " ", IFMT, 8, nsum.calls)
      print_val(io, "mem:", " ", IFMT, 8, nsum.mem)

      io << "\n"
    end
  end

  private def self.print_val(io : IO, prefix : String, suffix : String?, fmt : String, maxlen, val)
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