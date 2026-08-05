"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { PeriodConfig, ComparisonChartPoint } from "@/lib/comparison"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface MultiPeriodChartProps {
  periods: PeriodConfig[]
  data: ComparisonChartPoint[]
  theme?: "dark" | "light"
}

export function MultiPeriodChart({
  periods,
  data,
  theme = "dark",
}: MultiPeriodChartProps) {
  const [metric, setMetric] = React.useState<"revenue" | "orders">("revenue")

  const isDark = theme === "dark"
  const gridColor = isDark ? "#1e293b" : "#e2e8f0"
  const textColor = isDark ? "#94a3b8" : "#64748b"

  return (
    <Card className="bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800/90 shadow-xl">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-3">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Сравнителна графика на всички избрани периоди
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Всички {periods.length} периода са наложени на една графика по относителен ден от началото на периода.
          </CardDescription>
        </div>

        {/* Metric Switcher Button Group */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMetric("revenue")}
            className={`h-7 text-xs px-3 font-semibold rounded-lg transition-all ${
              metric === "revenue"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Приходи (€)
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMetric("orders")}
            className={`h-7 text-xs px-3 font-semibold rounded-lg transition-all ${
              metric === "orders"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Брой поръчки (#)
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="dayLabel"
                stroke={textColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
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
                    const rowData = payload[0].payload as ComparisonChartPoint
                    return (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md space-y-2.5 min-w-[220px]">
                        <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5">
                          <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                            {label} (Относителен ден)
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          {periods.map((p) => {
                            const valKey = `${p.id}_${metric}`
                            const dateKey = `${p.id}_date`
                            const val = rowData[valKey] || 0
                            const dateStr = rowData[dateKey] || ""

                            return (
                              <div key={p.id} className="flex items-center justify-between gap-4 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="h-2.5 w-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: p.color }}
                                  />
                                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                                    {p.label} {dateStr ? `(${dateStr})` : ""}
                                  </span>
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {metric === "revenue" ? formatCurrency(val) : `${val} поръчки`}
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
                  const p = periods.find((item) => `${item.id}_${metric}` === value || item.label === value)
                  return (
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {p ? p.label : value}
                    </span>
                  )
                }}
              />

              {periods.map((p) => (
                <Line
                  key={p.id}
                  type="monotone"
                  dataKey={`${p.id}_${metric}`}
                  name={p.label}
                  stroke={p.color}
                  strokeWidth={3}
                  dot={{ r: 4, stroke: p.color, strokeWidth: 2, fill: isDark ? "#0f172a" : "#ffffff" }}
                  activeDot={{ r: 7, stroke: p.color, strokeWidth: 2, fill: isDark ? "#0f172a" : "#ffffff" }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
