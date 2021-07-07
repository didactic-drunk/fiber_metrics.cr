module GC
  @@initialized = false

  def self.malloc(size : Int) : Void*
    if @@initialized
      Fiber.current.track_malloc size
    end
    previous_def
  end

  def self.malloc_atomic(size : Int) : Void*
    if @@initialized
      Fiber.current.track_malloc size
    end
    previous_def
  end

  # TODO: realloc
  def self.realloc(ptr : Void*, size : LibC::SizeT) : Void*
    previous_def
  end
end
