module GC
  alias TrackMallocCallback = (LibC::SizeT) -> Nil
#  @@track_malloc_func : TrackMallocCallback = ->(size : LibC::SizeT) { }
  @@track_malloc_func : TrackMallocCallback?

  # :nodoc:
  def self.set_tracking_funcs(malloc_cb : TrackMallocCallback)
    @@track_malloc_func = malloc_cb
  end

  def self.enable_memory_tracking
    mcb = ->(size : LibC::SizeT) { Fiber.current.track_malloc size }
    set_tracking_funcs mcb
  end

  # :nodoc:
  def self.malloc(size : LibC::SizeT) : Void*
# Segfault
#    @@track_malloc_func.call size
    @@track_malloc_func.try &.call(size)
    previous_def
  end

  # :nodoc:
  def self.malloc_atomic(size : LibC::SizeT) : Void*
    @@track_malloc_func.try &.call(size)
    previous_def
  end

  # :nodoc:
  def self.realloc(ptr : Void*, size : LibC::SizeT) : Void*
    # psize = prior_size ptr
    # tsize = size - prior_size
    # @@track_malloc_func.try &.call(tsize)
    previous_def
  end
end

GC.enable_memory_tracking
