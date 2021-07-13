require "./fiber"

class Channel(T)
  def send(value : T) : self
    Fiber.current.maybe_measure_blocking do
      previous_def
    end
  end

  def receive : T?
    Fiber.current.maybe_measure_idle do
      previous_def
    end
  end

  def receive? : T?
    Fiber.current.maybe_measure_idle do
      previous_def
    end
  end

  private def receive_impl__redef_broken
    Fiber.current.maybe_measure_idle do
      previous_def
    end
  end
end
