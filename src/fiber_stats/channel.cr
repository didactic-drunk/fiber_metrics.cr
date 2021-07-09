class Channel(T)
  def send(value : T) : self
    Fiber.current.maybe_measure :blocking do
      previous_def
    end
  end

  private def receive_impl
    Fiber.current.maybe_measure :idle do
      previous_def
    end
  end
end
