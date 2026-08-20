import { WooCommerceOrder } from "@/types/woocommerce"
import { getBulgarianDateString, getBulgarianTodayString, parseOrderDate } from "@/lib/timezone"
import { isPrimaryStatus } from "@/lib/woocommerce"

export interface PeriodConfig {
  id: string
  label: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  color: string
}

export interface SourceMetric {
  source: string
  revenue: number
  orders: number
  sharePercent: number
}

export interface PeriodSummary {
  period: PeriodConfig
  orders: WooCommerceOrder[]
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  sourceMetrics: SourceMetric[]
}

export interface ComparisonChartPoint {
  dayIndex: number
  dayLabel: string
  [key: string]: any // periodId_revenue, periodId_orders, periodId_date, etc.
}

export interface SourceComparisonRow {
  source: string
  periodValues: Record<string, { revenue: number; orders: number; sharePercent: number }>
  growthPercent?: number // Growth from Period 1 to Period 2
}

export interface MultiPeriodComparisonResult {
  periodSummaries: PeriodSummary[]
  chartPoints: ComparisonChartPoint[]
  sourceRows: SourceComparisonRow[]
  allSources: string[]
}

export const DEFAULT_PERIOD_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#06b6d4", // Cyan
]

function parseTotal(total: any): number {
  if (!total) return 0
  const str = String(total).replace(",", ".")
  const val = parseFloat(str)
  return isNaN(val) ? 0 : val
}

export function getPresetPeriods(): { name: string; label: string; periods: PeriodConfig[] }[] {
  const todayStr = getBulgarianTodayString()
  const [year, monthNum, dayNum] = todayStr.split("-").map(Number)
  const month = monthNum - 1

  const formatLocal = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }

  // Preset 1: This Month vs Last Month
  const thisMonthStart = new Date(year, month, 1)
  const thisMonthEnd = new Date(year, month, dayNum)

  const lastMonthStart = new Date(year, month - 1, 1)
  const lastMonthEnd = new Date(year, month, 0)

  // Preset 2: Last 7 Days vs Previous 7 Days
  const l7dEnd = new Date(year, month, dayNum)
  const l7dStart = new Date(l7dEnd)
  l7dStart.setDate(l7dEnd.getDate() - 6)

  const prev7dEnd = new Date(l7dStart)
  prev7dEnd.setDate(l7dStart.getDate() - 1)
  const prev7dStart = new Date(prev7dEnd)
  prev7dStart.setDate(prev7dEnd.getDate() - 6)

  // Preset 3: 3-Month Comparison (This Month vs Last Month vs 2 Months Ago)
  const month2AgoStart = new Date(year, month - 2, 1)
  const month2AgoEnd = new Date(year, month - 1, 0)

  return [
    {
      name: "this_vs_last_month",
      label: "Този месец vs Миналия месец (2 Периода)",
      periods: [
        {
          id: "p1",
          label: "Този месец",
          startDate: formatLocal(thisMonthStart),
          endDate: formatLocal(thisMonthEnd),
          color: DEFAULT_PERIOD_COLORS[0],
        },
        {
          id: "p2",
          label: "Миналия месец",
          startDate: formatLocal(lastMonthStart),
          endDate: formatLocal(lastMonthEnd),
          color: DEFAULT_PERIOD_COLORS[1],
        },
      ],
    },
    {
      name: "last_7d_vs_prev_7d",
      label: "Последните 7 дни vs Предишните 7 дни",
      periods: [
        {
          id: "p1",
          label: "Последните 7 дни",
          startDate: formatLocal(l7dStart),
          endDate: formatLocal(l7dEnd),
          color: DEFAULT_PERIOD_COLORS[0],
        },
        {
          id: "p2",
          label: "Предишните 7 дни",
          startDate: formatLocal(prev7dStart),
          endDate: formatLocal(prev7dEnd),
          color: DEFAULT_PERIOD_COLORS[1],
        },
      ],
    },
    {
      name: "three_months",
      label: "3 Месеца Сравнение (Този vs Миналия vs Преди 2 Месеца)",
      periods: [
        {
          id: "p1",
          label: "Този месец",
          startDate: formatLocal(thisMonthStart),
          endDate: formatLocal(thisMonthEnd),
          color: DEFAULT_PERIOD_COLORS[0],
        },
        {
          id: "p2",
          label: "Миналия месец",
          startDate: formatLocal(lastMonthStart),
          endDate: formatLocal(lastMonthEnd),
          color: DEFAULT_PERIOD_COLORS[1],
        },
        {
          id: "p3",
          label: "Преди 2 месеца",
          startDate: formatLocal(month2AgoStart),
          endDate: formatLocal(month2AgoEnd),
          color: DEFAULT_PERIOD_COLORS[2],
        },
      ],
    },
  ]
}

export function computeMultiPeriodComparison(
  allOrders: WooCommerceOrder[],
  periods: PeriodConfig[]
): MultiPeriodComparisonResult {
  if (!allOrders || periods.length === 0) {
    return {
      periodSummaries: [],
      chartPoints: [],
      sourceRows: [],
      allSources: [],
    }
  }

  // 1. Filter orders for each period & calculate metrics
  const periodSummaries: PeriodSummary[] = periods.map((p) => {
    const periodOrders = allOrders.filter((order) => {
      const orderDay = getBulgarianDateString(order.date_created)
      const afterStart = p.startDate ? orderDay >= p.startDate : true
      const beforeEnd = p.endDate ? orderDay <= p.endDate : true
      return afterStart && beforeEnd
    })

    const validOrders = periodOrders.filter(
      (o) => o && isPrimaryStatus(o.status)
    )

    const totalRevenue = validOrders.reduce((sum, o) => sum + parseTotal(o.total), 0)
    const totalOrders = validOrders.length
    const averageOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0

    // Source Breakdown
    const sourceMap: Record<string, { revenue: number; orders: number }> = {}
    periodOrders.forEach((o) => {
      const src = o.source || "Директна"
      if (!sourceMap[src]) sourceMap[src] = { revenue: 0, orders: 0 }
      if (isPrimaryStatus(o.status)) {
        sourceMap[src].revenue += parseTotal(o.total)
        sourceMap[src].orders += 1
      }
    })

    const sourceMetrics: SourceMetric[] = Object.entries(sourceMap).map(([src, d]) => ({
      source: src,
      revenue: parseFloat(d.revenue.toFixed(2)),
      orders: d.orders,
      sharePercent: totalRevenue > 0 ? parseFloat(((d.revenue / totalRevenue) * 100).toFixed(1)) : 0,
    }))

    return {
      period: p,
      orders: periodOrders,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      sourceMetrics,
    }
  })

  // 2. Build Single Overlay Graphic Points by Relative Day Index (Day 1, Day 2...)
  let maxDays = 1
  const periodDailyMaps: Record<string, Record<number, { dateStr: string; revenue: number; orders: number }>> = {}

  periods.forEach((p) => {
    periodDailyMaps[p.id] = {}

    const summary = periodSummaries.find((s) => s.period.id === p.id)
    const orders = summary ? summary.orders : []

    const [sY, sM, sD] = p.startDate.split("-").map(Number)
    const [eY, eM, eD] = p.endDate.split("-").map(Number)
    const startD = new Date(sY, sM - 1, sD)
    const endD = new Date(eY, eM - 1, eD)

    if (isNaN(startD.getTime()) || isNaN(endD.getTime()) || startD > endD) return

    const diffMs = endD.getTime() - startD.getTime()
    const numDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1)
    if (numDays > maxDays) maxDays = numDays

    // Group orders by relative day offset (0 to numDays - 1)
    orders.forEach((o) => {
      const orderDayStr = getBulgarianDateString(o.date_created)
      const [oY, oM, oD] = orderDayStr.split("-").map(Number)
      const oDate = new Date(oY, oM - 1, oD)
      const dayIdx = Math.round((oDate.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24))

      if (dayIdx >= 0 && dayIdx < numDays) {
        if (!periodDailyMaps[p.id][dayIdx]) {
          periodDailyMaps[p.id][dayIdx] = { dateStr: "", revenue: 0, orders: 0 }
        }
        if (isPrimaryStatus(o.status)) {
          periodDailyMaps[p.id][dayIdx].revenue += parseTotal(o.total)
          periodDailyMaps[p.id][dayIdx].orders += 1
        }
      }
    })

    // Assign date labels for each day index
    for (let i = 0; i < numDays; i++) {
      const curDate = new Date(sY, sM - 1, sD + i)
      const dateStr = curDate.toLocaleDateString("en-GB", { month: "short", day: "numeric" })
      if (!periodDailyMaps[p.id][i]) {
        periodDailyMaps[p.id][i] = { dateStr, revenue: 0, orders: 0 }
      } else {
        periodDailyMaps[p.id][i].dateStr = dateStr
      }
    }
  })

  // Limit max days plotted to e.g. 365
  const chartPoints: ComparisonChartPoint[] = []
  const plotDays = Math.min(maxDays, 365)

  for (let dayIdx = 0; dayIdx < plotDays; dayIdx++) {
    const point: ComparisonChartPoint = {
      dayIndex: dayIdx + 1,
      dayLabel: `Ден ${dayIdx + 1}`,
    }

    periods.forEach((p) => {
      const data = periodDailyMaps[p.id]?.[dayIdx] || { dateStr: "", revenue: 0, orders: 0 }
      point[`${p.id}_revenue`] = parseFloat(data.revenue.toFixed(2))
      point[`${p.id}_orders`] = data.orders
      point[`${p.id}_date`] = data.dateStr
    })

    chartPoints.push(point)
  }

  // 3. Activity Per Source Matrix
  const sourceSet = new Set<string>()
  periodSummaries.forEach((s) => {
    s.sourceMetrics.forEach((m) => sourceSet.add(m.source))
  })
  const allSources = Array.from(sourceSet).sort()

  const sourceRows: SourceComparisonRow[] = allSources.map((src) => {
    const periodValues: Record<string, { revenue: number; orders: number; sharePercent: number }> = {}

    periods.forEach((p) => {
      const summary = periodSummaries.find((s) => s.period.id === p.id)
      const metric = summary?.sourceMetrics.find((m) => m.source === src)
      periodValues[p.id] = {
        revenue: metric ? metric.revenue : 0,
        orders: metric ? metric.orders : 0,
        sharePercent: metric ? metric.sharePercent : 0,
      }
    })

    // Calculate growth between Period 1 and Period 2
    let growthPercent: number | undefined = undefined
    if (periods.length >= 2) {
      const rev1 = periodValues[periods[0].id]?.revenue || 0
      const rev2 = periodValues[periods[1].id]?.revenue || 0
      if (rev2 > 0) {
        growthPercent = parseFloat((((rev1 - rev2) / rev2) * 100).toFixed(1))
      } else if (rev1 > 0) {
        growthPercent = 100
      }
    }

    return {
      source: src,
      periodValues,
      growthPercent,
    }
  })

  return {
    periodSummaries,
    chartPoints,
    sourceRows,
    allSources,
  }
}
