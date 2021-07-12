require "./fiber"

class Mutex
  def lock : Nil
    Fiber.current.maybe_measure_blocking do
      previous_def
    end
  end
end
