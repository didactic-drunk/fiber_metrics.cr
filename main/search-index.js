crystal_doc_search_index_callback({"repository_name":"fiber_stats","body":"# Fiber metrics (Experimental)\n[![Crystal CI](https://github.com/didactic-drunk/fiber_stats.cr/actions/workflows/crystal.yml/badge.svg)](https://github.com/didactic-drunk/fiber_stats.cr/actions/workflows/crystal.yml)\n[![GitHub release](https://img.shields.io/github/release/didactic-drunk/fiber_stats.cr.svg)](https://github.com/didactic-drunk/fiber_stats.cr/releases)\n![GitHub commits since latest release (by date) for a branch](https://img.shields.io/github/commits-since/didactic-drunk/fiber_stats.cr/latest)\n[![Docs](https://img.shields.io/badge/docs-available-brightgreen.svg)](https://didactic-drunk.github.io/fiber_stats.cr/main)\n\nTrack run time, wait time or memory allocations per `Fiber`, method or block.\n\nDesigned for low overhead use in production.\n\n## TODO\n- [x] `Channel.send,recv`\n- [ ] `sleep`\n- [x] `Mutex`\n- [ ] `IO`\n- [ ] Hook in to `Scheduler`\n\n\n## Installation\n\n1. Add the dependency to your `shard.yml`:\n\n   ```yaml\n   dependencies:\n     fiber_stats:\n       github: didactic-drunk/fiber_stats.cr\n   ```\n\n2. Run `shards install`\n\n## Usage\n\n```crystal\nrequire \"fiber_stats\"\n\nclass Example\n  include Fiber::Metrics\n\n  @[Measure]\n  def run\n    sleep 0.2\n  end\nend\n\ne = Example.new\ne.run\n\nFiber.print_stats\n```\n\n## Output\n```\nExample.run tt:   0.203 rt:   0.200                           calls:      1    mem: 0k\n```\n\n\n## Contributing\n\n1. Fork it (<https://github.com/didactic-drunk/fiber_stats.cr/fork>)\n2. Create your feature branch (`git checkout -b my-new-feature`)\n3. Commit your changes (`git commit -am 'Add some feature'`)\n4. Push to the branch (`git push origin my-new-feature`)\n5. Create a new Pull Request\n\n## Contributors\n\n- [Didactic Drunk](https://github.com/didactic-drunk) - creator and maintainer\n","program":{"html_id":"fiber_stats/toplevel","path":"toplevel.html","kind":"module","full_name":"Top Level Namespace","name":"Top Level Namespace","abstract":false,"superclass":null,"ancestors":[],"locations":[],"repository_name":"fiber_stats","program":true,"enum":false,"alias":false,"aliased":null,"aliased_html":null,"const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":null,"doc":null,"summary":null,"class_methods":[],"constructors":[],"instance_methods":[],"macros":[],"types":[{"html_id":"fiber_stats/Channel","path":"Channel.html","kind":"class","full_name":"Channel(T)","name":"Channel","abstract":false,"superclass":{"html_id":"fiber_stats/Reference","kind":"class","full_name":"Reference","name":"Reference"},"ancestors":[{"html_id":"fiber_stats/Reference","kind":"class","full_name":"Reference","name":"Reference"},{"html_id":"fiber_stats/Object","kind":"class","full_name":"Object","name":"Object"}],"locations":[{"filename":"src/fiber_stats/channel.cr","line_number":3,"url":"https://github.com/didactic-drunk/fiber_stats.cr/blob/31d2e1fa5bc08b3b5e2ff123805a11e713fa29f0/src/fiber_stats/channel.cr#L3"}],"repository_name":"fiber_stats","program":false,"enum":false,"alias":false,"aliased":null,"aliased_html":null,"const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":null,"doc":"A `Channel` enables concurrent communication between fibers.\n\nThey allow communicating data between fibers without sharing memory and without having to worry about locks, semaphores or other special structures.\n\n```\nchannel = Channel(Int32).new\n\nspawn do\n  channel.send(0)\n  channel.send(1)\nend\n\nchannel.receive # => 0\nchannel.receive # => 1\n```\n\nNOTE: Although a `Channel(Nil)` or any other nilable types like `Channel(Int32?)` are valid\nthey are discouraged since from certain methods or constructs it receiving a `nil` as data\nwill be indistinguishable from a closed channel.\n","summary":"<p>A <code><a href=\"Channel.html\">Channel</a></code> enables concurrent communication between fibers.</p>","class_methods":[],"constructors":[],"instance_methods":[{"id":"send(value:T):self-instance-method","html_id":"send(value:T):self-instance-method","name":"send","doc":"Sends a value to the channel.\nIf the channel has spare capacity, then the method returns immediately.\nOtherwise, this method blocks the calling fiber until another fiber calls `#receive` on the channel.\n\nRaises `ClosedError` if the channel is closed or closes while waiting on a full channel.","summary":"<p>Sends a value to the channel.</p>","abstract":false,"args":[{"name":"value","doc":null,"default_value":"","external_name":"value","restriction":"T"}],"args_string":"(value : T) : <span class=\"k\">self</span>","args_html":"(value : T) : <span class=\"k\">self</span>","location":{"filename":"src/fiber_stats/channel.cr","line_number":4,"url":"https://github.com/didactic-drunk/fiber_stats.cr/blob/31d2e1fa5bc08b3b5e2ff123805a11e713fa29f0/src/fiber_stats/channel.cr#L4"},"def":{"name":"send","args":[{"name":"value","doc":null,"default_value":"","external_name":"value","restriction":"T"}],"double_splat":null,"splat_index":null,"yields":null,"block_arg":null,"return_type":"self","visibility":"Public","body":"Fiber.current.maybe_measure_blocking do\n  previous_def(value)\nend"}}],"macros":[],"types":[]},{"html_id":"fiber_stats/Fiber","path":"Fiber.html","kind":"class","full_name":"Fiber","name":"Fiber","abstract":false,"superclass":{"html_id":"fiber_stats/Reference","kind":"class","full_name":"Reference","name":"Reference"},"ancestors":[{"html_id":"fiber_stats/Reference","kind":"class","full_name":"Reference","name":"Reference"},{"html_id":"fiber_stats/Object","kind":"class","full_name":"Object","name":"Object"}],"locations":[{"filename":"src/fiber_stats/call_track.cr","line_number":1,"url":"https://github.com/didactic-drunk/fiber_stats.cr/blob/31d2e1fa5bc08b3b5e2ff123805a11e713fa29f0/src/fiber_stats/call_track.cr#L1"},{"filename":"src/fiber_stats/fiber.cr","line_number":1,"url":"https://github.com/didactic-drunk/fiber_stats.cr/blob/31d2e1fa5bc08b3b5e2ff123805a11e713fa29f0/src/fiber_stats/fiber.cr#L1"}],"repository_name":"fiber_stats","program":false,"enum":false,"alias":false,"aliased":null,"aliased_html":null,"const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":null,"doc":"A `Fiber` is a light-weight execution unit managed by the Crystal runtime.\n\nIt is conceptually similar to an operating system thread but with less\noverhead and completely internal to the Crystal process. The runtime includes\na scheduler which schedules execution of fibers.\n\nA `Fiber` has a stack size of `8 MiB` which is usually also assigned\nto an operating system thread. But only `4KiB` are actually allocated at first\nso the memory footprint is very small.\n\nCommunication between fibers is usually passed through `Channel`.\n\n## Cooperative\n\nFibers are cooperative. That means execution can only be drawn from a fiber\nwhen it offers it. It can't be interrupted in its execution at random.\nIn order to make concurrency work, fibers must make sure to occasionally\nprovide hooks for the scheduler to swap in other fibers.\nIO operations like reading from a file descriptor are natural implementations\nfor this and the developer does not need to take further action on that. When\nIO access can't be served immediately by a buffer, the fiber will\nautomatically wait and yield execution. When IO is ready it's going to be\nresumed through the event loop.\n\nWhen a computation-intensive task has none or only rare IO operations, a fiber\nshould explicitly offer to yield execution from time to time using\n`Fiber.yield` to break up tight loops. The frequency of this call depends on\nthe application and concurrency model.\n\n## Event loop\n\nThe event loop is responsible for keeping track of sleeping fibers waiting for\nnotifications that IO is ready or a timeout reached. When a fiber can be woken,\nthe event loop enqueues it in the scheduler","summary":"<p>A <code><a href=\"Fiber.html\">Fiber</a></code> is a light-weight execution unit managed by the Crystal runtime.</p>","class_methods":[{"id":"print_stats(io=STDOUT):Nil-class-method","html_id":"print_stats(io=STDOUT):Nil-class-method","name":"print_stats","doc":null,"summary":null,"abstract":false,"args":[{"name":"io","doc":null,"default_value":"STDOUT","external_name":"io","restriction":""}],"args_string":"(io = <span class=\"t\">STDOUT</span>) : Nil","args_html":"(io = <span class=\"t\">STDOUT</span>) : Nil","location":{"filename":"src/fiber_stats/fiber.cr","line_number":150,"url":"https://github.com/didactic-drunk/fiber_stats.cr/blob/31d2e1fa5bc08b3b5e2ff123805a11e713fa29f0/src/fiber_stats/fiber.cr#L150"},"def":{"name":"print_stats","args":[{"name":"io","doc":null,"default_value":"STDOUT","external_name":"io","restriction":""}],"double_splat":null,"splat_index":null,"yields":null,"block_arg":null,"return_type":"Nil","visibility":"Public","body":"puts(\"Stats:\")\nkey_size_max = 0\nstats.to_a.sort_by do |key, nsum|\n  key_size_max = Math.max(key.bytesize, key_size_max)\n  nsum.rt\nend.reverse.each do |key, nsum|\n  io << key\n  pad(io, (key_size_max + 1) - key.bytesize)\n  print_val(io, \"tt:\", \" \", FFMT, 8, nsum.tt)\n  print_val(io, \"rt:\", \" \", FFMT, 8, nsum.rt)\n  print_val(io, \"idle:\", \" \", FFMT, 8, nsum.idle)\n  print_val(io, \"blkd:\", \" \", FFMT, 8, nsum.blocking)\n  print_val(io, \"calls:\", \" \", IFMT, 8, nsum.calls)\n  print_val(io, \"mem:\", \"K \", IFMT, 8, nsum.mem / 1024)\n  io << \"\\n\"\nend\n"}},{"id":"stats-class-method","html_id":"stats-class-method","name":"stats","doc":null,"summary":null,"abstract":false,"args":[],"args_string":"","args_html":"","location":{"filename":"src/fiber_stats/fiber.cr","line_number":133,"url":"https://github.com/didactic-drunk/fiber_stats.cr/blob/31d2e1fa5bc08b3b5e2ff123805a11e713fa29f0/src/fiber_stats/fiber.cr#L133"},"def":{"name":"stats","args":[],"double_splat":null,"splat_index":null,"yields":null,"block_arg":null,"return_type":"","visibility":"Public","body":"hash = Hash(String, CallTrack).new\nMSUMMARY_MUTEX.synchronize do\n  @@msummary.each do |mkey, nsum|\n    nsum.each do |nkey, calls|\n      k = nkey ? \"#{mkey},#{nkey}\" : mkey\n      hash[k] = calls\n    end\n  end\nend\nhash\n"}}],"constructors":[],"instance_methods":[],"macros":[{"id":"measure(name=nil)-macro","html_id":"measure(name=nil)-macro","name":"measure","doc":null,"summary":"<p><span class=\"flag lime\">EXPERIMENTAL</span>  </p>\n\n","abstract":false,"args":[{"name":"name","doc":null,"default_value":"nil","external_name":"name","restriction":""}],"args_string":"(name = <span class=\"n\">nil</span>)","location":{"filename":"src/fiber_stats/fiber.cr","line_number":27,"url":"https://github.com/didactic-drunk/fiber_stats.cr/blob/31d2e1fa5bc08b3b5e2ff123805a11e713fa29f0/src/fiber_stats/fiber.cr#L27"},"def":{"name":"measure","args":[{"name":"name","doc":null,"default_value":"nil","external_name":"name","restriction":""}],"double_splat":null,"splat_index":null,"block_arg":null,"visibility":"Public","body":"    Fiber.current.measure_internal \n\\{\n{\"#{@type.name.id}.#{@def.name.id}\"}}, \n{{ name }}\n, Fiber::TrackingType::Measure do\n      \n{{ yield }}\n\n    \nend\n  \n"}},{"id":"measure_blocking(name=nil)-macro","html_id":"measure_blocking(name=nil)-macro","name":"measure_blocking","doc":null,"summary":"<p><span class=\"flag lime\">EXPERIMENTAL</span>  </p>\n\n","abstract":false,"args":[{"name":"name","doc":null,"default_value":"nil","external_name":"name","restriction":""}],"args_string":"(name = <span class=\"n\">nil</span>)","location":{"filename":"src/fiber_stats/fiber.cr","line_number":41,"url":"https://github.com/didactic-drunk/fiber_stats.cr/blob/31d2e1fa5bc08b3b5e2ff123805a11e713fa29f0/src/fiber_stats/fiber.cr#L41"},"def":{"name":"measure_blocking","args":[{"name":"name","doc":null,"default_value":"nil","external_name":"name","restriction":""}],"double_splat":null,"splat_index":null,"block_arg":null,"visibility":"Public","body":"    Fiber.current.measure_internal \n\\{\n{\"#{@type.name.id}.#{@def.name.id}\"}}, \n{{ name }}\n, Fiber::TrackingType::Blocking do\n      \n{{ yield }}\n\n    \nend\n  \n"}},{"id":"measure_idle(name=nil)-macro","html_id":"measure_idle(name=nil)-macro","name":"measure_idle","doc":null,"summary":"<p><span class=\"flag lime\">EXPERIMENTAL</span>  </p>\n\n","abstract":false,"args":[{"name":"name","doc":null,"default_value":"nil","external_name":"name","restriction":""}],"args_string":"(name = <span class=\"n\">nil</span>)","location":{"filename":"src/fiber_stats/fiber.cr","line_number":34,"url":"https://github.com/didactic-drunk/fiber_stats.cr/blob/31d2e1fa5bc08b3b5e2ff123805a11e713fa29f0/src/fiber_stats/fiber.cr#L34"},"def":{"name":"measure_idle","args":[{"name":"name","doc":null,"default_value":"nil","external_name":"name","restriction":""}],"double_splat":null,"splat_index":null,"block_arg":null,"visibility":"Public","body":"    Fiber.current.measure_internal \n\\{\n{\"#{@type.name.id}.#{@def.name.id}\"}}, \n{{ name }}\n, Fiber::TrackingType::Idle do\n      \n{{ yield }}\n\n    \nend\n  \n"}}],"types":[{"html_id":"fiber_stats/Fiber/MethodSummaryT","path":"Fiber/MethodSummaryT.html","kind":"alias","full_name":"Fiber::MethodSummaryT","name":"MethodSummaryT","abstract":false,"superclass":null,"ancestors":[],"locations":[{"filename":"src/fiber_stats/fiber.cr","line_number":3,"url":"https://github.com/didactic-drunk/fiber_stats.cr/blob/31d2e1fa5bc08b3b5e2ff123805a11e713fa29f0/src/fiber_stats/fiber.cr#L3"}],"repository_name":"fiber_stats","program":false,"enum":false,"alias":true,"aliased":"Hash(String, Hash(String | Symbol | Nil, Fiber::CallTrack))","aliased_html":"Hash(String, Hash(String | Symbol | Nil, Fiber::CallTrack))","const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":{"html_id":"fiber_stats/Fiber","kind":"class","full_name":"Fiber","name":"Fiber"},"doc":null,"summary":null,"class_methods":[],"constructors":[],"instance_methods":[],"macros":[],"types":[]},{"html_id":"fiber_stats/Fiber/Metrics","path":"Fiber/Metrics.html","kind":"module","full_name":"Fiber::Metrics","name":"Metrics","abstract":false,"superclass":null,"ancestors":[],"locations":[{"filename":"src/fiber_stats/metrics.cr","line_number":1,"url":"https://github.com/didactic-drunk/fiber_stats.cr/blob/31d2e1fa5bc08b3b5e2ff123805a11e713fa29f0/src/fiber_stats/metrics.cr#L1"}],"repository_name":"fiber_stats","program":false,"enum":false,"alias":false,"aliased":null,"aliased_html":null,"const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":{"html_id":"fiber_stats/Fiber","kind":"class","full_name":"Fiber","name":"Fiber"},"doc":null,"summary":null,"class_methods":[],"constructors":[],"instance_methods":[],"macros":[],"types":[{"html_id":"fiber_stats/Fiber/Metrics/ClassMethods","path":"Fiber/Metrics/ClassMethods.html","kind":"module","full_name":"Fiber::Metrics::ClassMethods","name":"ClassMethods","abstract":false,"superclass":null,"ancestors":[],"locations":[{"filename":"src/fiber_stats/metrics.cr","line_number":5,"url":"https://github.com/didactic-drunk/fiber_stats.cr/blob/31d2e1fa5bc08b3b5e2ff123805a11e713fa29f0/src/fiber_stats/metrics.cr#L5"}],"repository_name":"fiber_stats","program":false,"enum":false,"alias":false,"aliased":null,"aliased_html":null,"const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":{"html_id":"fiber_stats/Fiber/Metrics","kind":"module","full_name":"Fiber::Metrics","name":"Metrics"},"doc":null,"summary":null,"class_methods":[],"constructors":[],"instance_methods":[],"macros":[],"types":[]},{"html_id":"fiber_stats/Fiber/Metrics/InstanceMethods","path":"Fiber/Metrics/InstanceMethods.html","kind":"module","full_name":"Fiber::Metrics::InstanceMethods","name":"InstanceMethods","abstract":false,"superclass":null,"ancestors":[],"locations":[{"filename":"src/fiber_stats/metrics.cr","line_number":9,"url":"https://github.com/didactic-drunk/fiber_stats.cr/blob/31d2e1fa5bc08b3b5e2ff123805a11e713fa29f0/src/fiber_stats/metrics.cr#L9"}],"repository_name":"fiber_stats","program":false,"enum":false,"alias":false,"aliased":null,"aliased_html":null,"const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":{"html_id":"fiber_stats/Fiber/Metrics","kind":"module","full_name":"Fiber::Metrics","name":"Metrics"},"doc":null,"summary":null,"class_methods":[],"constructors":[],"instance_methods":[],"macros":[],"types":[]},{"html_id":"fiber_stats/Fiber/Metrics/Measure","path":"Fiber/Metrics/Measure.html","kind":"annotation","full_name":"Fiber::Metrics::Measure","name":"Measure","abstract":false,"superclass":null,"ancestors":[],"locations":[{"filename":"src/fiber_stats/metrics.cr","line_number":2,"url":"https://github.com/didactic-drunk/fiber_stats.cr/blob/31d2e1fa5bc08b3b5e2ff123805a11e713fa29f0/src/fiber_stats/metrics.cr#L2"}],"repository_name":"fiber_stats","program":false,"enum":false,"alias":false,"aliased":null,"aliased_html":null,"const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":{"html_id":"fiber_stats/Fiber/Metrics","kind":"module","full_name":"Fiber::Metrics","name":"Metrics"},"doc":null,"summary":null,"class_methods":[],"constructors":[],"instance_methods":[],"macros":[],"types":[]}]},{"html_id":"fiber_stats/Fiber/NameSummaryT","path":"Fiber/NameSummaryT.html","kind":"alias","full_name":"Fiber::NameSummaryT","name":"NameSummaryT","abstract":false,"superclass":null,"ancestors":[],"locations":[{"filename":"src/fiber_stats/fiber.cr","line_number":2,"url":"https://github.com/didactic-drunk/fiber_stats.cr/blob/31d2e1fa5bc08b3b5e2ff123805a11e713fa29f0/src/fiber_stats/fiber.cr#L2"}],"repository_name":"fiber_stats","program":false,"enum":false,"alias":true,"aliased":"Hash(String | Symbol | Nil, Fiber::CallTrack)","aliased_html":"Hash(String | Symbol | Nil, Fiber::CallTrack)","const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":{"html_id":"fiber_stats/Fiber","kind":"class","full_name":"Fiber","name":"Fiber"},"doc":null,"summary":null,"class_methods":[],"constructors":[],"instance_methods":[],"macros":[],"types":[]},{"html_id":"fiber_stats/Fiber/Stats","path":"Fiber/Stats.html","kind":"module","full_name":"Fiber::Stats","name":"Stats","abstract":false,"superclass":null,"ancestors":[],"locations":[{"filename":"src/fiber_stats.cr","line_number":1,"url":"https://github.com/didactic-drunk/fiber_stats.cr/blob/31d2e1fa5bc08b3b5e2ff123805a11e713fa29f0/src/fiber_stats.cr#L1"}],"repository_name":"fiber_stats","program":false,"enum":false,"alias":false,"aliased":null,"aliased_html":null,"const":false,"constants":[{"id":"VERSION","name":"VERSION","value":"\"0.1.0\"","doc":null,"summary":null}],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":{"html_id":"fiber_stats/Fiber","kind":"class","full_name":"Fiber","name":"Fiber"},"doc":null,"summary":null,"class_methods":[],"constructors":[],"instance_methods":[],"macros":[],"types":[]}]},{"html_id":"fiber_stats/GC","path":"GC.html","kind":"module","full_name":"GC","name":"GC","abstract":false,"superclass":null,"ancestors":[],"locations":[{"filename":"src/fiber_stats/gc.cr","line_number":1,"url":"https://github.com/didactic-drunk/fiber_stats.cr/blob/31d2e1fa5bc08b3b5e2ff123805a11e713fa29f0/src/fiber_stats/gc.cr#L1"}],"repository_name":"fiber_stats","program":false,"enum":false,"alias":false,"aliased":null,"aliased_html":null,"const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":null,"doc":null,"summary":null,"class_methods":[{"id":"enable_memory_tracking-class-method","html_id":"enable_memory_tracking-class-method","name":"enable_memory_tracking","doc":null,"summary":null,"abstract":false,"args":[],"args_string":"","args_html":"","location":{"filename":"src/fiber_stats/gc.cr","line_number":11,"url":"https://github.com/didactic-drunk/fiber_stats.cr/blob/31d2e1fa5bc08b3b5e2ff123805a11e713fa29f0/src/fiber_stats/gc.cr#L11"},"def":{"name":"enable_memory_tracking","args":[],"double_splat":null,"splat_index":null,"yields":null,"block_arg":null,"return_type":"","visibility":"Public","body":"mcb = ->(size : LibC::SizeT) do\n  Fiber.current.track_malloc(size)\nend\nset_tracking_funcs(mcb)\n"}}],"constructors":[],"instance_methods":[],"macros":[],"types":[{"html_id":"fiber_stats/GC/TrackMallocCallback","path":"GC/TrackMallocCallback.html","kind":"alias","full_name":"GC::TrackMallocCallback","name":"TrackMallocCallback","abstract":false,"superclass":null,"ancestors":[],"locations":[{"filename":"src/fiber_stats/gc.cr","line_number":2,"url":"https://github.com/didactic-drunk/fiber_stats.cr/blob/31d2e1fa5bc08b3b5e2ff123805a11e713fa29f0/src/fiber_stats/gc.cr#L2"}],"repository_name":"fiber_stats","program":false,"enum":false,"alias":true,"aliased":"Proc(UInt64, Nil)","aliased_html":"UInt64 -> Nil","const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":{"html_id":"fiber_stats/GC","kind":"module","full_name":"GC","name":"GC"},"doc":null,"summary":null,"class_methods":[],"constructors":[],"instance_methods":[],"macros":[],"types":[]}]},{"html_id":"fiber_stats/Mutex","path":"Mutex.html","kind":"class","full_name":"Mutex","name":"Mutex","abstract":false,"superclass":{"html_id":"fiber_stats/Reference","kind":"class","full_name":"Reference","name":"Reference"},"ancestors":[{"html_id":"fiber_stats/Reference","kind":"class","full_name":"Reference","name":"Reference"},{"html_id":"fiber_stats/Object","kind":"class","full_name":"Object","name":"Object"}],"locations":[{"filename":"src/fiber_stats/mutex.cr","line_number":3,"url":"https://github.com/didactic-drunk/fiber_stats.cr/blob/31d2e1fa5bc08b3b5e2ff123805a11e713fa29f0/src/fiber_stats/mutex.cr#L3"}],"repository_name":"fiber_stats","program":false,"enum":false,"alias":false,"aliased":null,"aliased_html":null,"const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":null,"doc":"A fiber-safe mutex.\n\nProvides deadlock protection by default. Attempting to re-lock the mutex from\nthe same fiber will raise an exception. Trying to unlock an unlocked mutex, or\na mutex locked by another fiber will raise an exception.\n\nThe reentrant protection maintains a lock count. Attempting to re-lock the\nmutex from the same fiber will increment the lock count. Attempting to unlock\nthe counter from the same fiber will decrement the lock count, eventually\nreleasing the lock when the lock count returns to 0. Attempting to unlock an\nunlocked mutex, or a mutex locked by another fiber will raise an exception.\n\nYou also disable all protections with `unchecked`. Attempting to re-lock the\nmutex from the same fiber will deadlock. Any fiber can unlock the mutex, even\nif it wasn't previously locked.","summary":"<p>A fiber-safe mutex.</p>","class_methods":[],"constructors":[],"instance_methods":[{"id":"lock:Nil-instance-method","html_id":"lock:Nil-instance-method","name":"lock","doc":null,"summary":null,"abstract":false,"args":[],"args_string":" : Nil","args_html":" : Nil","location":{"filename":"src/fiber_stats/mutex.cr","line_number":4,"url":"https://github.com/didactic-drunk/fiber_stats.cr/blob/31d2e1fa5bc08b3b5e2ff123805a11e713fa29f0/src/fiber_stats/mutex.cr#L4"},"def":{"name":"lock","args":[],"double_splat":null,"splat_index":null,"yields":null,"block_arg":null,"return_type":"Nil","visibility":"Public","body":"Fiber.current.maybe_measure_blocking do\n  previous_def()\nend"}}],"macros":[],"types":[]}]}})