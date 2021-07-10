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
      \{% for meth in @type.methods.select &.annotation(Measure) %}
        def \{{meth.name}}(\{{meth.args.splat}})
{{debug}}
STDERR.puts "running"
          Fiber.current.measure_internal "foo", nil, :measure do
            previous_def
          end
        end
      \{% end %}
    end
  end
end
