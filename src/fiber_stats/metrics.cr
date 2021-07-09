module Fiber::Metrics
  annotation Measure
  end

  module ClassMethods
    
  end

  module InstanceMethods
  end

  macro included
    extend ClassMethods
    include InstanceMethods

    macro finished
      {% for meth in @type.methods.select &.annotation(Measure) %}
        def self.{{meth.name}}({{meth.args}})
{{debug}}
          Fiber.measure do
            previous_def
          end
        end
      {% end %}
    end
  end
end
