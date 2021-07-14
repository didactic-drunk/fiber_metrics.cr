require "tallboy"

class Fiber
  private STATS_COLOR_THRESHOLDS = [
    {0.9, :red},
    {0.5, :yellow},
    {0.05, :default},
    {0.0, :light_gray},
  ]

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
    calls_thresholds = [{0.0, :default}]
    id_thresholds = thresholds_for data, 1
    bl_thresholds = thresholds_for data, 2
    rt_thresholds = thresholds_for data, 3
    tt_thresholds = thresholds_for data, 4
    mem_thresholds = thresholds_for data, 5

    data = data.map do |row|
      [
        colorize(ifmt, row[0], calls_thresholds),
        colorize(ffmt, row[1], id_thresholds),
        colorize(ffmt, row[2], bl_thresholds),
        colorize(ffmt, row[3], rt_thresholds),
        colorize(ffmt, row[4], tt_thresholds),
        colorize(mfmt, row[5], mem_thresholds),
        row.last,
      ]
    end

    table = Tallboy.table do
      columns do
        add "Calls"
        add "IdleT"
        add "BlkT"
        add "RunT"
        add "Total"
        add "Mem"
        add "Name"
      end

      header
      rows data
    end


    table.render io: STDOUT
  end

  private def self.thresholds_for(data, colno)
    column = data.map { |row| row[colno].to_f }
    min = column.min
    max = column.max

    STATS_COLOR_THRESHOLDS.map do |thres, color|
      {max * thres, color}
    end
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
