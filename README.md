# `Fiber` metrics (experimental)

Track run time, wait time, memory allocations per `Fiber`, method or block.

Designed for low overhead use in production.

## TODO
- [x] `Channel.send,recv`
- [ ] `sleep`
- [ ] `Mutex`
- [ ] `IO`
- [ ] Hook in to `Scheduler`


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
  include Fiber::Stats

  def run
    Fiber.measure :running do
      # ...

      Fiber.measure_idle :sleep do
        sleep 0.2
      end
    end
  end

end

e = Example.new
e.run

Fiber.print_stats
```

Output:
```
Example.run,running tt:   0.216 rt:   0.002 idle:   0.214                   calls:      1    mem: 0k
Example.run,sleep   tt:   0.214             idle:   0.214                   calls:      1              
```


## Contributing

1. Fork it (<https://github.com/didactic-drunk/fiber_stats.cr/fork>)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

## Contributors

- [Didactic Drunk](https://github.com/didactic-drunk) - creator and maintainer
