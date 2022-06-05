require "../fiber"

# class ::IO::FileDescriptor < IO
module ::Crystal::System::FileDescriptor
  private def unbuffered_read(slice : Bytes)
    ::Fiber.current.maybe_measure_idle do
      previous_def
    end
  end

  private def unbuffered_write(slice : Bytes)
    ::Fiber.current.maybe_measure_blocking do
      previous_def
    end
  end

  # TODO: close, flock
end
