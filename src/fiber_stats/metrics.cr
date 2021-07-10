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
        def \{{meth.name}}(\{{meth.args.splat}}\{{meth.block_arg ? ", &#{meth.block_arg}".id : nil}}) \{{meth.return_type ? ": #{meth.return_type}".id : "".id}}
          Fiber.current.measure_internal \{{"#{@type.name.id}.#{meth.name}"}}, nil, :measure do
            previous_def \{{meth.block_arg ? " &#{meth.block_arg}".id : "".id}}
          end
        end
      \{% end %}
    end
  end
end
