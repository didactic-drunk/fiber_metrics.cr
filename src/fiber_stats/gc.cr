module GC
  alias TrackMallocCallback = (LibC::SizeT) -> Nil
  alias TrackReallocCallback = (Void*, LibC::SizeT) -> Nil
  @@track_malloc_func : TrackMallocCallback = ->(size : LibC::SizeT) { }
  @@track_realloc_func : TrackReallocCallback = ->(ptr : Void*, size : LibC::SizeT) { }

  def self.set_tracking_funcs(malloc_cb : TrackMallocCallback, realloc_cb : TrackReallocCallback?)
    @@track_malloc_func = malloc_cb
#    @@track_realloc_func = realloc_cb if realloc_cb
  end

  def self.malloc(size : Int) : Void*
    @@track_malloc_func.call LibC::SizeT.new(size)
    previous_def
  end

  def self.malloc_atomic(size : Int) : Void*
    @@track_malloc_func.call LibC::SizeT.new(size)
    previous_def
  end

  def self.realloc(ptr : Void*, size : LibC::SizeT) : Void*
#    @@track_realloc_func.call ptr, size
    previous_def
  end

  def self.enable_memory_tracking
    mcb = ->(size : LibC::SizeT) { Fiber.current.track_malloc size }
    recb = nil
#    recb = ->(ptr : Void*, size : LibC::SizeT) { Fiber.current.track_realloc ptr, size }
#    recb = ->(ptr : Void*, size : LibC::SizeT) { }
    set_tracking_funcs mcb, recb
  end
end


GC.enable_memory_tracking
