crystal_doc_search_index_callback({"repository_name":"fiber_metrics","body":"# Fiber metrics (Experimental)\n[![Crystal CI](https://github.com/didactic-drunk/fiber_metrics.cr/actions/workflows/crystal.yml/badge.svg)](https://github.com/didactic-drunk/fiber_metrics.cr/actions/workflows/crystal.yml)\n[![GitHub release](https://img.shields.io/github/release/didactic-drunk/fiber_metrics.cr.svg)](https://github.com/didactic-drunk/fiber_metrics.cr/releases)\n![GitHub commits since latest release (by date) for a branch](https://img.shields.io/github/commits-since/didactic-drunk/fiber_metrics.cr/latest)\n[![Docs](https://img.shields.io/badge/docs-available-brightgreen.svg)](https://didactic-drunk.github.io/fiber_metrics.cr/main)\n\nTrack run time, wait time or memory allocations per `Fiber`, method or block.\n\nDesigned for low overhead use in production.\n\nNOTE: This shard is modular.\n* `require \"fiber_metrics\"` Requires the minimum necessary to run with the lowest overhead\n* `require \"fiber_metrics/all\"` Batteries included\n* * Crystal is monkey patched to record idle/blocking time\n\n## TODO\n- [x] `Channel.send,recv`\n- [ ] `sleep`\n- [x] `Mutex`\n- [ ] `IO`\n- [ ] Hook in to `Scheduler`\n- [ ] ENV to control printing\n\n\n## Installation\n\n1. Add the dependency to your `shard.yml`:\n\n   ```yaml\n   dependencies:\n     fiber_metrics:\n       github: didactic-drunk/fiber_metrics.cr\n   ```\n\n2. Run `shards install`\n\n## Usage\n\n\n```crystal\nrequire \"fiber_metrics/all\"\n\nclass Example\n  # Must be included in each class with an annotation **including subclasses**\n  include Fiber::Metrics\n\n  @[Measure]\n  def foo\n    bar\n    sleep 0.2\n    Bytes.new 16384\n  end\n\n  @[Measure]\n  def bar\n    baz\n    sleep 0.2\n    Bytes.new 32768\n  end\n  @[Measure]\n\n  @[Measure]\n  def baz\n    sleep 0.2\n    Bytes.new 65536\n  end\nend\n\ne = Example.new\ne.foo\n\nFiber.print_stats\n```\n\n## Output\n```\n<span class='term-fg37'>foo</span>\n┌───────┬───────┬───────┬───────┬───────┬───────┬───────┐\n│ Calls │ IdleT │ BlkT  │ RunT  │ Total │ Mem   │ Name  │\n├───────┼───────┼───────┼───────┼───────┼───────┼───────┤\n│    1  │       │       │ 0.209 │ 0.209 │   64K │ C.baz │\n│    1  │       │       │ 0.205 │ 0.414 │   32K │ C.bar │\n│    1  │       │       │ 0.204 │ 0.622 │   16K │ C.foo │\n└───────┴───────┴───────┴───────┴───────┴───────┴───────┘\n```\n\nOutput is best viewed with [`less -RS`, `bat`]\n\n## How it works\n\n`@[Measure]` wraps each method in (2) `Time.monotonic` calls and records the difference.\n\nThe collected metrics use Fiber local storage (no locking) until the first measured call returns\nafter which the local metrics are merged with a global set of metrics wrapped in a Mutex.\n\nThis means metrics are unavailable via `Fiber.stats` until the first measured method `foo` returns.\nThis is ideal for\n* Applications that show/record stats before exit\n* Request/response (HTTP, message queue, etc) type servers that want periodic snapshots of activity\n\n### @[Measure] Logic\n```crystal\n@[Measure]\ndef foo\n  # Time.monotonic\n  bar\n  # Time.monotonic\n  # Store metrics in fiber local storage\n  # Merge fiber local metrics with global metrics\n  # Reset fiber local metrics\nend\n\n@[Measure]\ndef bar\n  # Time.monotonic\n  baz\n  # Time.monotonic\n  # Store metrics in fiber local storage\nend\n\n@[Measure]\ndef baz\n  # Time.monotonic\n  ...\n  # Time.monotonic\n  # Store metrics in fiber local storage\nend\n```\n\n\nMore options to control the merging process may appear after use cases are discussed.\nOpen a discussion if the current behavior doesn't fit your needs.\n\n\n## Contributing\n\n1. Fork it (<https://github.com/didactic-drunk/fiber_metrics.cr/fork>)\n2. Create your feature branch (`git checkout -b my-new-feature`)\n3. Commit your changes (`git commit -am 'Add some feature'`)\n4. Push to the branch (`git push origin my-new-feature`)\n5. Create a new Pull Request\n\n## Contributors\n\n- [Didactic Drunk](https://github.com/didactic-drunk) - creator and maintainer\n","program":{"html_id":"fiber_metrics/toplevel","path":"toplevel.html","kind":"module","full_name":"Top Level Namespace","name":"Top Level Namespace","abstract":false,"superclass":null,"ancestors":[],"locations":[],"repository_name":"fiber_metrics","program":true,"enum":false,"alias":false,"aliased":null,"aliased_html":null,"const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":null,"doc":null,"summary":null,"class_methods":[],"constructors":[],"instance_methods":[],"macros":[],"types":[{"html_id":"fiber_metrics/Channel","path":"Channel.html","kind":"class","full_name":"Channel(T)","name":"Channel","abstract":false,"superclass":{"html_id":"fiber_metrics/Reference","kind":"class","full_name":"Reference","name":"Reference"},"ancestors":[{"html_id":"fiber_metrics/Reference","kind":"class","full_name":"Reference","name":"Reference"},{"html_id":"fiber_metrics/Object","kind":"class","full_name":"Object","name":"Object"}],"locations":[{"filename":"src/fiber_metrics/channel.cr","line_number":3,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/channel.cr#L3"}],"repository_name":"fiber_metrics","program":false,"enum":false,"alias":false,"aliased":null,"aliased_html":null,"const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":null,"doc":"A `Channel` enables concurrent communication between fibers.\n\nThey allow communicating data between fibers without sharing memory and without having to worry about locks, semaphores or other special structures.\n\n```\nchannel = Channel(Int32).new\n\nspawn do\n  channel.send(0)\n  channel.send(1)\nend\n\nchannel.receive # => 0\nchannel.receive # => 1\n```\n\nNOTE: Although a `Channel(Nil)` or any other nilable types like `Channel(Int32?)` are valid\nthey are discouraged since from certain methods or constructs it receiving a `nil` as data\nwill be indistinguishable from a closed channel.\n","summary":"<p>A <code><a href=\"Channel.html\">Channel</a></code> enables concurrent communication between fibers.</p>","class_methods":[],"constructors":[],"instance_methods":[{"id":"receive:T?-instance-method","html_id":"receive:T?-instance-method","name":"receive","doc":"Receives a value from the channel.\nIf there is a value waiting, then it is returned immediately. Otherwise, this method blocks until a value is sent to the channel.\n\nRaises `ClosedError` if the channel is closed or closes while waiting for receive.\n\n```\nchannel = Channel(Int32).new\nspawn do\n  channel.send(1)\nend\nchannel.receive # => 1\n```","summary":"<p>Receives a value from the channel.</p>","abstract":false,"args":[],"args_string":" : T?","args_html":" : T?","location":{"filename":"src/fiber_metrics/channel.cr","line_number":10,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/channel.cr#L10"},"def":{"name":"receive","args":[],"double_splat":null,"splat_index":null,"yields":null,"block_arg":null,"return_type":"T | ::Nil","visibility":"Public","body":"Fiber.current.maybe_measure_idle do\n  previous_def()\nend"}},{"id":"receive?:T?-instance-method","html_id":"receive?:T?-instance-method","name":"receive?","doc":"Receives a value from the channel.\nIf there is a value waiting, it is returned immediately. Otherwise, this method blocks until a value is sent to the channel.\n\nReturns `nil` if the channel is closed or closes while waiting for receive.","summary":"<p>Receives a value from the channel.</p>","abstract":false,"args":[],"args_string":" : T?","args_html":" : T?","location":{"filename":"src/fiber_metrics/channel.cr","line_number":16,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/channel.cr#L16"},"def":{"name":"receive?","args":[],"double_splat":null,"splat_index":null,"yields":null,"block_arg":null,"return_type":"T | ::Nil","visibility":"Public","body":"Fiber.current.maybe_measure_idle do\n  previous_def()\nend"}},{"id":"send(value:T):self-instance-method","html_id":"send(value:T):self-instance-method","name":"send","doc":"Sends a value to the channel.\nIf the channel has spare capacity, then the method returns immediately.\nOtherwise, this method blocks the calling fiber until another fiber calls `#receive` on the channel.\n\nRaises `ClosedError` if the channel is closed or closes while waiting on a full channel.","summary":"<p>Sends a value to the channel.</p>","abstract":false,"args":[{"name":"value","doc":null,"default_value":"","external_name":"value","restriction":"T"}],"args_string":"(value : T) : <span class=\"k\">self</span>","args_html":"(value : T) : <span class=\"k\">self</span>","location":{"filename":"src/fiber_metrics/channel.cr","line_number":4,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/channel.cr#L4"},"def":{"name":"send","args":[{"name":"value","doc":null,"default_value":"","external_name":"value","restriction":"T"}],"double_splat":null,"splat_index":null,"yields":null,"block_arg":null,"return_type":"self","visibility":"Public","body":"Fiber.current.maybe_measure_blocking do\n  previous_def(value)\nend"}}],"macros":[],"types":[]},{"html_id":"fiber_metrics/Fiber","path":"Fiber.html","kind":"class","full_name":"Fiber","name":"Fiber","abstract":false,"superclass":{"html_id":"fiber_metrics/Reference","kind":"class","full_name":"Reference","name":"Reference"},"ancestors":[{"html_id":"fiber_metrics/Reference","kind":"class","full_name":"Reference","name":"Reference"},{"html_id":"fiber_metrics/Object","kind":"class","full_name":"Object","name":"Object"}],"locations":[{"filename":"src/fiber_metrics/call_track.cr","line_number":1,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/call_track.cr#L1"},{"filename":"src/fiber_metrics/fiber.cr","line_number":3,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/fiber.cr#L3"},{"filename":"src/fiber_metrics/printer/tallboy.cr","line_number":3,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/printer/tallboy.cr#L3"}],"repository_name":"fiber_metrics","program":false,"enum":false,"alias":false,"aliased":null,"aliased_html":null,"const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":null,"doc":"A `Fiber` is a light-weight execution unit managed by the Crystal runtime.\n\nIt is conceptually similar to an operating system thread but with less\noverhead and completely internal to the Crystal process. The runtime includes\na scheduler which schedules execution of fibers.\n\nA `Fiber` has a stack size of `8 MiB` which is usually also assigned\nto an operating system thread. But only `4KiB` are actually allocated at first\nso the memory footprint is very small.\n\nCommunication between fibers is usually passed through `Channel`.\n\n## Cooperative\n\nFibers are cooperative. That means execution can only be drawn from a fiber\nwhen it offers it. It can't be interrupted in its execution at random.\nIn order to make concurrency work, fibers must make sure to occasionally\nprovide hooks for the scheduler to swap in other fibers.\nIO operations like reading from a file descriptor are natural implementations\nfor this and the developer does not need to take further action on that. When\nIO access can't be served immediately by a buffer, the fiber will\nautomatically wait and yield execution. When IO is ready it's going to be\nresumed through the event loop.\n\nWhen a computation-intensive task has none or only rare IO operations, a fiber\nshould explicitly offer to yield execution from time to time using\n`Fiber.yield` to break up tight loops. The frequency of this call depends on\nthe application and concurrency model.\n\n## Event loop\n\nThe event loop is responsible for keeping track of sleeping fibers waiting for\nnotifications that IO is ready or a timeout reached. When a fiber can be woken,\nthe event loop enqueues it in the scheduler","summary":"<p>A <code><a href=\"Fiber.html\">Fiber</a></code> is a light-weight execution unit managed by the Crystal runtime.</p>","class_methods":[{"id":"print_stats(io=STDOUT):Nil-class-method","html_id":"print_stats(io=STDOUT):Nil-class-method","name":"print_stats","doc":null,"summary":"<p><span class=\"flag lime\">EXPERIMENTAL</span>  </p>\n\n","abstract":false,"args":[{"name":"io","doc":null,"default_value":"STDOUT","external_name":"io","restriction":""}],"args_string":"(io = <span class=\"t\">STDOUT</span>) : Nil","args_html":"(io = <span class=\"t\">STDOUT</span>) : Nil","location":{"filename":"src/fiber_metrics/printer/tallboy.cr","line_number":22,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/printer/tallboy.cr#L22"},"def":{"name":"print_stats","args":[{"name":"io","doc":null,"default_value":"STDOUT","external_name":"io","restriction":""}],"double_splat":null,"splat_index":null,"yields":null,"block_arg":null,"return_type":"Nil","visibility":"Public","body":"data = stats.map do |k, v|\n  [v.calls, v.idle.to_f, v.blocking.to_f, v.rt.to_f, v.tt.to_f, (  v.mem / 1024), k]\nend.sort_by do |row|\n  row[3].as(Float64)\nend.to_a\nffmt = \"%.3f\"\nifmt = \"%4d\"\nmfmt = \"%4dK\"\ncalls_thresholds = [{0.0, :light_gray}]\nid_thresholds = thresholds_for(data, 1)\nbl_thresholds = thresholds_for(data, 2)\nrt_thresholds = thresholds_for(data, 3)\ntt_thresholds = thresholds_for(data, 4)\nmem_thresholds = thresholds_for(data, 5, STATS_COLOR_THRESHOLDS_MEM)\ndata = data.map do |row|\n  [colorize(ifmt, row[0], calls_thresholds), colorize(ffmt, row[1], id_thresholds), colorize(ffmt, row[2], bl_thresholds), colorize(ffmt, row[3], rt_thresholds), colorize(ffmt, row[4], tt_thresholds), colorize(mfmt, row[5], mem_thresholds), row.last]\nend\ntable = Tallboy.table do\n  columns do\n    add(\"Calls\")\n    add(\"IdleT\")\n    add(\"BlkT\")\n    add(\"RunT\")\n    add(\"Total\")\n    add(\"Mem\")\n    add(\"Name\")\n  end\n  header\n  rows(data)\nend\ntable.render(io: STDOUT)\n"}},{"id":"stats-class-method","html_id":"stats-class-method","name":"stats","doc":null,"summary":"<p><span class=\"flag lime\">EXPERIMENTAL</span>  </p>\n\n","abstract":false,"args":[],"args_string":"","args_html":"","location":{"filename":"src/fiber_metrics/fiber.cr","line_number":136,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/fiber.cr#L136"},"def":{"name":"stats","args":[],"double_splat":null,"splat_index":null,"yields":null,"block_arg":null,"return_type":"","visibility":"Public","body":"hash = Hash(String, CallTrack).new\nMSUMMARY_MUTEX.synchronize do\n  @@msummary.each do |mkey, nsum|\n    nsum.each do |nkey, calls|\n      k = nkey ? \"#{mkey},#{nkey}\" : mkey\n      hash[k] = calls\n    end\n  end\nend\nhash\n"}}],"constructors":[],"instance_methods":[],"macros":[{"id":"measure(name=nil)-macro","html_id":"measure(name=nil)-macro","name":"measure","doc":null,"summary":"<p><span class=\"flag lime\">EXPERIMENTAL</span>  </p>\n\n","abstract":false,"args":[{"name":"name","doc":null,"default_value":"nil","external_name":"name","restriction":""}],"args_string":"(name = <span class=\"n\">nil</span>)","location":{"filename":"src/fiber_metrics/fiber.cr","line_number":29,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/fiber.cr#L29"},"def":{"name":"measure","args":[{"name":"name","doc":null,"default_value":"nil","external_name":"name","restriction":""}],"double_splat":null,"splat_index":null,"block_arg":null,"visibility":"Public","body":"    Fiber.current.measure_internal \n\\{\n{\"#{@type.name.id}.#{@def.name.id}\"}}, \n{{ name }}\n, Fiber::TrackingType::Measure do\n      \n{{ yield }}\n\n    \nend\n  \n"}},{"id":"measure_blocking(name=nil)-macro","html_id":"measure_blocking(name=nil)-macro","name":"measure_blocking","doc":null,"summary":"<p><span class=\"flag lime\">EXPERIMENTAL</span>  </p>\n\n","abstract":false,"args":[{"name":"name","doc":null,"default_value":"nil","external_name":"name","restriction":""}],"args_string":"(name = <span class=\"n\">nil</span>)","location":{"filename":"src/fiber_metrics/fiber.cr","line_number":43,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/fiber.cr#L43"},"def":{"name":"measure_blocking","args":[{"name":"name","doc":null,"default_value":"nil","external_name":"name","restriction":""}],"double_splat":null,"splat_index":null,"block_arg":null,"visibility":"Public","body":"    Fiber.current.measure_internal \n\\{\n{\"#{@type.name.id}.#{@def.name.id}\"}}, \n{{ name }}\n, Fiber::TrackingType::Blocking do\n      \n{{ yield }}\n\n    \nend\n  \n"}},{"id":"measure_idle(name=nil)-macro","html_id":"measure_idle(name=nil)-macro","name":"measure_idle","doc":null,"summary":"<p><span class=\"flag lime\">EXPERIMENTAL</span>  </p>\n\n","abstract":false,"args":[{"name":"name","doc":null,"default_value":"nil","external_name":"name","restriction":""}],"args_string":"(name = <span class=\"n\">nil</span>)","location":{"filename":"src/fiber_metrics/fiber.cr","line_number":36,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/fiber.cr#L36"},"def":{"name":"measure_idle","args":[{"name":"name","doc":null,"default_value":"nil","external_name":"name","restriction":""}],"double_splat":null,"splat_index":null,"block_arg":null,"visibility":"Public","body":"    Fiber.current.measure_internal \n\\{\n{\"#{@type.name.id}.#{@def.name.id}\"}}, \n{{ name }}\n, Fiber::TrackingType::Idle do\n      \n{{ yield }}\n\n    \nend\n  \n"}}],"types":[{"html_id":"fiber_metrics/Fiber/MethodSummaryT","path":"Fiber/MethodSummaryT.html","kind":"alias","full_name":"Fiber::MethodSummaryT","name":"MethodSummaryT","abstract":false,"superclass":null,"ancestors":[],"locations":[{"filename":"src/fiber_metrics/fiber.cr","line_number":5,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/fiber.cr#L5"}],"repository_name":"fiber_metrics","program":false,"enum":false,"alias":true,"aliased":"Hash(String, Hash(String | Symbol | Nil, Fiber::CallTrack))","aliased_html":"Hash(String, Hash(String | Symbol | Nil, Fiber::CallTrack))","const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":{"html_id":"fiber_metrics/Fiber","kind":"class","full_name":"Fiber","name":"Fiber"},"doc":null,"summary":null,"class_methods":[],"constructors":[],"instance_methods":[],"macros":[],"types":[]},{"html_id":"fiber_metrics/Fiber/Metrics","path":"Fiber/Metrics.html","kind":"module","full_name":"Fiber::Metrics","name":"Metrics","abstract":false,"superclass":null,"ancestors":[],"locations":[{"filename":"src/fiber_metrics/metrics.cr","line_number":3,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/metrics.cr#L3"}],"repository_name":"fiber_metrics","program":false,"enum":false,"alias":false,"aliased":null,"aliased_html":null,"const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":{"html_id":"fiber_metrics/Fiber","kind":"class","full_name":"Fiber","name":"Fiber"},"doc":null,"summary":null,"class_methods":[],"constructors":[],"instance_methods":[],"macros":[],"types":[{"html_id":"fiber_metrics/Fiber/Metrics/ClassMethods","path":"Fiber/Metrics/ClassMethods.html","kind":"module","full_name":"Fiber::Metrics::ClassMethods","name":"ClassMethods","abstract":false,"superclass":null,"ancestors":[],"locations":[{"filename":"src/fiber_metrics/metrics.cr","line_number":7,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/metrics.cr#L7"}],"repository_name":"fiber_metrics","program":false,"enum":false,"alias":false,"aliased":null,"aliased_html":null,"const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":{"html_id":"fiber_metrics/Fiber/Metrics","kind":"module","full_name":"Fiber::Metrics","name":"Metrics"},"doc":null,"summary":null,"class_methods":[],"constructors":[],"instance_methods":[],"macros":[],"types":[]},{"html_id":"fiber_metrics/Fiber/Metrics/InstanceMethods","path":"Fiber/Metrics/InstanceMethods.html","kind":"module","full_name":"Fiber::Metrics::InstanceMethods","name":"InstanceMethods","abstract":false,"superclass":null,"ancestors":[],"locations":[{"filename":"src/fiber_metrics/metrics.cr","line_number":11,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/metrics.cr#L11"}],"repository_name":"fiber_metrics","program":false,"enum":false,"alias":false,"aliased":null,"aliased_html":null,"const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":{"html_id":"fiber_metrics/Fiber/Metrics","kind":"module","full_name":"Fiber::Metrics","name":"Metrics"},"doc":null,"summary":null,"class_methods":[],"constructors":[],"instance_methods":[],"macros":[],"types":[]},{"html_id":"fiber_metrics/Fiber/Metrics/Measure","path":"Fiber/Metrics/Measure.html","kind":"annotation","full_name":"Fiber::Metrics::Measure","name":"Measure","abstract":false,"superclass":null,"ancestors":[],"locations":[{"filename":"src/fiber_metrics/metrics.cr","line_number":4,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/metrics.cr#L4"}],"repository_name":"fiber_metrics","program":false,"enum":false,"alias":false,"aliased":null,"aliased_html":null,"const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":{"html_id":"fiber_metrics/Fiber/Metrics","kind":"module","full_name":"Fiber::Metrics","name":"Metrics"},"doc":null,"summary":null,"class_methods":[],"constructors":[],"instance_methods":[],"macros":[],"types":[]}]},{"html_id":"fiber_metrics/Fiber/NameSummaryT","path":"Fiber/NameSummaryT.html","kind":"alias","full_name":"Fiber::NameSummaryT","name":"NameSummaryT","abstract":false,"superclass":null,"ancestors":[],"locations":[{"filename":"src/fiber_metrics/fiber.cr","line_number":4,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/fiber.cr#L4"}],"repository_name":"fiber_metrics","program":false,"enum":false,"alias":true,"aliased":"Hash(String | Symbol | Nil, Fiber::CallTrack)","aliased_html":"Hash(String | Symbol | Nil, Fiber::CallTrack)","const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":{"html_id":"fiber_metrics/Fiber","kind":"class","full_name":"Fiber","name":"Fiber"},"doc":null,"summary":null,"class_methods":[],"constructors":[],"instance_methods":[],"macros":[],"types":[]}]},{"html_id":"fiber_metrics/GC","path":"GC.html","kind":"module","full_name":"GC","name":"GC","abstract":false,"superclass":null,"ancestors":[],"locations":[{"filename":"src/fiber_metrics/gc.cr","line_number":1,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/gc.cr#L1"}],"repository_name":"fiber_metrics","program":false,"enum":false,"alias":false,"aliased":null,"aliased_html":null,"const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":null,"doc":null,"summary":null,"class_methods":[{"id":"enable_memory_tracking-class-method","html_id":"enable_memory_tracking-class-method","name":"enable_memory_tracking","doc":null,"summary":null,"abstract":false,"args":[],"args_string":"","args_html":"","location":{"filename":"src/fiber_metrics/gc.cr","line_number":11,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/gc.cr#L11"},"def":{"name":"enable_memory_tracking","args":[],"double_splat":null,"splat_index":null,"yields":null,"block_arg":null,"return_type":"","visibility":"Public","body":"mcb = ->(size : LibC::SizeT) do\n  Fiber.current.track_malloc(size)\nend\nset_tracking_funcs(mcb)\n"}}],"constructors":[],"instance_methods":[],"macros":[],"types":[{"html_id":"fiber_metrics/GC/TrackMallocCallback","path":"GC/TrackMallocCallback.html","kind":"alias","full_name":"GC::TrackMallocCallback","name":"TrackMallocCallback","abstract":false,"superclass":null,"ancestors":[],"locations":[{"filename":"src/fiber_metrics/gc.cr","line_number":2,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/gc.cr#L2"}],"repository_name":"fiber_metrics","program":false,"enum":false,"alias":true,"aliased":"Proc(UInt64, Nil)","aliased_html":"UInt64 -> Nil","const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":{"html_id":"fiber_metrics/GC","kind":"module","full_name":"GC","name":"GC"},"doc":null,"summary":null,"class_methods":[],"constructors":[],"instance_methods":[],"macros":[],"types":[]}]},{"html_id":"fiber_metrics/Mutex","path":"Mutex.html","kind":"class","full_name":"Mutex","name":"Mutex","abstract":false,"superclass":{"html_id":"fiber_metrics/Reference","kind":"class","full_name":"Reference","name":"Reference"},"ancestors":[{"html_id":"fiber_metrics/Reference","kind":"class","full_name":"Reference","name":"Reference"},{"html_id":"fiber_metrics/Object","kind":"class","full_name":"Object","name":"Object"}],"locations":[{"filename":"src/fiber_metrics/mutex.cr","line_number":3,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/mutex.cr#L3"}],"repository_name":"fiber_metrics","program":false,"enum":false,"alias":false,"aliased":null,"aliased_html":null,"const":false,"constants":[],"included_modules":[],"extended_modules":[],"subclasses":[],"including_types":[],"namespace":null,"doc":"A fiber-safe mutex.\n\nProvides deadlock protection by default. Attempting to re-lock the mutex from\nthe same fiber will raise an exception. Trying to unlock an unlocked mutex, or\na mutex locked by another fiber will raise an exception.\n\nThe reentrant protection maintains a lock count. Attempting to re-lock the\nmutex from the same fiber will increment the lock count. Attempting to unlock\nthe counter from the same fiber will decrement the lock count, eventually\nreleasing the lock when the lock count returns to 0. Attempting to unlock an\nunlocked mutex, or a mutex locked by another fiber will raise an exception.\n\nYou also disable all protections with `unchecked`. Attempting to re-lock the\nmutex from the same fiber will deadlock. Any fiber can unlock the mutex, even\nif it wasn't previously locked.","summary":"<p>A fiber-safe mutex.</p>","class_methods":[],"constructors":[],"instance_methods":[{"id":"lock:Nil-instance-method","html_id":"lock:Nil-instance-method","name":"lock","doc":null,"summary":null,"abstract":false,"args":[],"args_string":" : Nil","args_html":" : Nil","location":{"filename":"src/fiber_metrics/mutex.cr","line_number":4,"url":"https://github.com/didactic-drunk/fiber_metrics.cr/blob/721256640d3cfe62849a0efeb0b3a42167c2b061/src/fiber_metrics/mutex.cr#L4"},"def":{"name":"lock","args":[],"double_splat":null,"splat_index":null,"yields":null,"block_arg":null,"return_type":"Nil","visibility":"Public","body":"Fiber.current.maybe_measure_blocking do\n  previous_def()\nend"}}],"macros":[],"types":[]}]}})