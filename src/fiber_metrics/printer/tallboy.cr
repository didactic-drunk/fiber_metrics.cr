require "tallboy"

class Fiber
  # TODO: choose thresholds based on compile time measurement counting
  private STATS_COLOR_THRESHOLDS = [
    {0.90, :red},
    {0.70, :light_red},
    {0.50, :yellow},
    {0.05, :default},
    {0.01, :light_gray},
    {0.00, :dark_gray},
  ]

  private STATS_COLOR_THRESHOLDS_MEM = [
    {0.20, :cyan},
    {0.05, :default},
    {0.01, :light_gray},
    {0.00, :dark_gray},
  ]

  private STATS_THRESHOLD_MIN = 0.001 # .1 %

  # * An empty space means 0.  For memory this means no allocations
  # * 0K or 0.000 means < half the number specified.  For memory it means less than 0.5K
  @[Experimental]
  def self.print_stats(io = STDOUT) : Nil
    data = stats.map { |k, v|
      [v.calls, v.idle.to_f, v.blocking.to_f, v.rt.to_f, v.tt.to_f, (v.mem/1024), k]
    }.sort_by { |row|
      # TOOD: flexible sorting
      row[3].as(Float64)
    }.to_a

    ffmt = "%.3f" # float
    ifmt = "%4d" # int
    mfmt = "%4dK" # mem

    #calls_thresholds = thresholds_for data, 4
    calls_thresholds = [{0.0, :light_gray}]
    id_thres_min, id_thresholds = thresholds_for data, 1
    bl_thres_min, bl_thresholds = thresholds_for data, 2
    rt_thres_min, rt_thresholds = thresholds_for data, 3
    tt_thres_min, tt_thresholds = thresholds_for data, 4
    mem_thres_min, mem_thresholds = thresholds_for data, 5, STATS_COLOR_THRESHOLDS_MEM

    # Discard data where all values are < .1% of total
    data = data.select { |row|
      row[1].as(Float64) > id_thres_min ||
      row[2].as(Float64) > bl_thres_min ||
      row[3].as(Float64) > rt_thres_min ||
      row[4].as(Float64) > tt_thres_min ||
      row[5].as(Float64) > mem_thres_min
    }.map { |row|
      [
        colorize(ifmt, row[0], calls_thresholds),
        colorize(ffmt, row[1], id_thresholds),
        colorize(ffmt, row[2], bl_thresholds),
        colorize(ffmt, row[3], rt_thresholds),
        colorize(ffmt, row[4], tt_thresholds),
        colorize(mfmt, row[5], mem_thresholds),
        row.last,
      ]
    }

    table = Tallboy.table do
      columns do
        add "Calls", align: :center
        add "IdleT", align: :right
        add "BlkT", align: :right
        add "RunT", align: :right
        add "Total", align: :right
        add "Mem", align: :right
        add "Name", align: :left
      end

      header
      rows data
    end


    table.render io: STDOUT
    puts ""
  end

  private def self.thresholds_for(data, colno, color_thresholds = STATS_COLOR_THRESHOLDS)
    column = data.map { |row| row[colno].to_f }
#    min = column.min
    max = column.max

    thresholds = color_thresholds.map do |thres, color|
      {max * thres, color}
    end

    thres_min = column.sum * STATS_THRESHOLD_MIN

    {thres_min, thresholds}
  end

  private def self.colorize(fmt, val, thresholds)
    case val
    when Float, Int
      val = val.to_f
      return "" if val == 0.0

      str = fmt % val
      thresholds.each do |th|
        if val >= th.first
          return str.colorize(th.last).to_s
        end
      end
      str
    else
      raise "unhandled type #{typeof(val)} #{val}"
    end
  end
end
