# fiber_stats

WIP: Currently debugging

## Installation

1. Add the dependency to your `shard.yml`:

   ```yaml
   dependencies:
     fiber_stats:
       github: didactic-drunk/fiber_stats.cr
   ```

2. Run `shards install`

## Usage

```crystal
require "fiber_stats"

class Example
  def run
    Fiber.measure :running do
      # ...

      Fiber.idle :sleep do
        sleep 0.2
      end
    end
  end

  C.new.run
  Fiber.print_stats
end
```

Output:
```
C.run,running tt:   0.216 rt:   0.002 idle:   0.214                   calls:      1
C.run,sleep   tt:   0.214             idle:   0.214                   calls:      1              
```

TODO: Write usage instructions here

## Development

TODO: Write development instructions here

## Contributing

1. Fork it (<https://github.com/didactic-drunk/fiber_stats.cr/fork>)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

## Contributors

- [Didactic Drunk](https://github.com/didactic-drunk) - creator and maintainer
