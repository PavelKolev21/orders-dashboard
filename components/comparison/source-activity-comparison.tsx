"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { PeriodSummary, SourceComparisonRow, PeriodConfig } from "@/lib/comparison"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Layers, BarChart3 } from "lucide-react"

interface SourceActivityComparisonProps {
  periodSummaries: PeriodSummary[]
  sourceRows: SourceComparisonRow[]
  periods: PeriodConfig[]
  theme?: "dark" | "light"
}

export function SourceActivityComparison({
  periodSummaries,
  sourceRows,
  periods,
  theme = "dark",
}: SourceActivityComparisonProps) {
  const [metric, setMetric] = React.useState<"revenue" | "orders">("revenue")

  const isDark = theme === "dark"
  const gridColor = isDark ? "#1e293b" : "#e2e8f0"
  const textColor = isDark ? "#94a3b8" : "#64748b"

  // Prepare data for Grouped Bar Chart by Source
  const barChartData = React.useMemo(() => {
    return sourceRows.map((row) => {
      const item: Record<string, any> = { source: row.source }
      periods.forEach((p) => {
        item[`${p.id}_revenue`] = row.periodValues[p.id]?.revenue || 0
        item[`${p.id}_orders`] = row.periodValues[p.id]?.orders || 0
      })
      return item
    })
  }, [sourceRows, periods])

  return (
    <div className="space-y-6">
      {/* 1. Source Share Distribution Overview Cards for each period */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-indigo-500" />
          Разпределение по източници за всеки период
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {periodSummaries.map((s) => (
            <Card
              key={s.period.id}
              className="bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800/90 shadow-md"
            >
              <CardHeader className="pb-2 border-b border-slate-200 dark:border-slate-800/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: s.period.color }}
                    />
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                      {s.period.label}
                    </CardTitle>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {s.period.startDate} &rarr; {s.period.endDate}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500">Общо: {formatCurrency(s.totalRevenue)}</span>
                  <span className="text-xs text-slate-500">{s.totalOrders} поръчки</span>
                </div>
              </CardHeader>

              <CardContent className="pt-3 space-y-2">
                {s.sourceMetrics.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">Няма данни за източници за този период.</p>
                ) : (
                  s.sourceMetrics
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5)
                    .map((m) => (
                      <div key={m.source} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                            {m.source}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(m.revenue)} ({m.sharePercent}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, m.sharePercent)}%`,
                              backgroundColor: s.period.color,
                            }}
                          />
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 2. Grouped Bar Chart comparing Sources side-by-side */}
      <Card className="bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800/90 shadow-xl">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Съпоставка по източници на поръчки (Source Comparison)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Сравнение на приходите и поръчките по канали (Releva, Google, Direct и др.) между периодите.
            </CardDescription>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMetric("revenue")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                metric === "revenue"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Приходи (€)
            </button>
            <button
              type="button"
              onClick={() => setMetric("orders")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                metric === "orders"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Поръчки (#)
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="source"
                  stroke={textColor}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  stroke={textColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => (metric === "revenue" ? `${val} €` : `${val}`)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-2xl space-y-2">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Източник: {label}
                          </p>
                          <div className="space-y-1">
                            {periods.map((p) => {
                              const valKey = `${p.id}_${metric}`
                              const val = payload.find((item) => item.dataKey === valKey)?.value || 0

                              return (
                                <div key={p.id} className="flex items-center justify-between gap-4 text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="h-2.5 w-2.5 rounded-full shrink-0"
                                      style={{ backgroundColor: p.color }}
                                    />
                                    <span className="text-slate-600 dark:text-slate-300">{p.label}:</span>
                                  </div>
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {metric === "revenue" ? formatCurrency(Number(val)) : `${val} поръчки`}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend
                  formatter={(value) => {
                    const p = periods.find((item) => `${item.id}_${metric}` === value)
                    return (
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {p ? p.label : value}
                      </span>
                    )
                  }}
                />
                {periods.map((p) => (
                  <Bar
                    key={p.id}
                    dataKey={`${p.id}_${metric}`}
                    name={p.label}
                    fill={p.color}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 3. Detailed Comparative Source Performance Table Matrix */}
      <Card className="bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800/90 shadow-xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
            Детайлна матрица по източници (Activity Matrix per Source)
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Сравнение на приходи, брой поръчки и процентен дял за всеки източник във всеки период.
          </CardDescription>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Източник (Source)</th>
                {periods.map((p) => (
                  <th key={p.id} className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      <span>{p.label}</span>
                    </div>
                  </th>
                ))}
                {periods.length >= 2 && <th className="py-3 px-4 text-right">Растеж (P1 vs P2)</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
              {sourceRows.length === 0 ? (
                <tr>
                  <td colSpan={periods.length + 2} className="py-6 text-center text-slate-400">
                    Няма намерени източници за тези периоди.
                  </td>
                </tr>
              ) : (
                sourceRows.map((row) => (
                  <tr
                    key={row.source}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {row.source}
                    </td>

                    {periods.map((p) => {
                      const val = row.periodValues[p.id] || { revenue: 0, orders: 0, sharePercent: 0 }
                      return (
                        <td key={p.id} className="py-3 px-4 text-right space-y-0.5">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {formatCurrency(val.revenue)}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {val.orders} поръчки ({val.sharePercent}%)
                          </div>
                        </td>
                      )
                    })}

                    {periods.length >= 2 && (
                      <td className="py-3 px-4 text-right">
                        {row.growthPercent !== undefined ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-xs ${
                              row.growthPercent >= 0
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {row.growthPercent >= 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {row.growthPercent >= 0 ? `+${row.growthPercent}%` : `${row.growthPercent}%`}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
