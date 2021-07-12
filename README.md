# Fiber metrics (Experimental)
[![Crystal CI](https://github.com/didactic-drunk/fiber_stats.cr/actions/workflows/crystal.yml/badge.svg)](https://github.com/didactic-drunk/fiber_stats.cr/actions/workflows/crystal.yml)
[![GitHub release](https://img.shields.io/github/release/didactic-drunk/fiber_stats.cr.svg)](https://github.com/didactic-drunk/fiber_stats.cr/releases)
![GitHub commits since latest release (by date) for a branch](https://img.shields.io/github/commits-since/didactic-drunk/fiber_stats.cr/latest)
[![Docs](https://img.shields.io/badge/docs-available-brightgreen.svg)](https://didactic-drunk.github.io/fiber_stats.cr/main)

Track run time, wait time or memory allocations per `Fiber`, method or block.

Designed for low overhead use in production.

## TODO
- [x] `Channel.send,recv`
- [ ] `sleep`
- [x] `Mutex`
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
  include Fiber::Metrics

  @[Measure]
  def run
    sleep 0.2
  end
end

e = Example.new
e.run

Fiber.print_stats
```

## Output
```
Example.run tt:   0.203 rt:   0.200                           calls:      1    mem: 0k
```


## Contributing

1. Fork it (<https://github.com/didactic-drunk/fiber_stats.cr/fork>)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

## Contributors

- [Didactic Drunk](https://github.com/didactic-drunk) - creator and maintainer
