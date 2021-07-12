require "./fiber"

class Channel(T)
  def send(value : T) : self
    Fiber.current.maybe_measure_blocking do
      previous_def
    end
  end

  private def receive_impl
    Fiber.current.maybe_measure_idle do
      previous_def
    end
  end
end
