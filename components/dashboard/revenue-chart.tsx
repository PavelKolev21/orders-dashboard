"use client"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface RevenueTrend {
  date: string
  formattedDate: string
  revenue: number
  orders: number
}

interface RevenueChartProps {
  data: RevenueTrend[]
  theme?: "dark" | "light"
}

export function RevenueChart({ data, theme = "dark" }: RevenueChartProps) {
  const isDark = theme === "dark"
  const gridColor = isDark ? "#1e293b" : "#e2e8f0"
  const textColor = isDark ? "#64748b" : "#64748b"

  // Detect if chart data represents hourly breakdown (e.g. "00:00", "01:00", etc.)
  const isHourly = data.length > 0 && data[0].formattedDate.includes(":")

  return (
    <Card className="bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800/90 shadow-md dark:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {isHourly ? "Часови график на продажбите (Hourly Revenue Trends)" : "Дневен график на продажбите (Daily Revenue Trends)"}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            {isHourly
              ? "Разпределение по часове (00:00 - 23:00) за избрания ден"
              : "Дневен преглед на приходите от WooCommerce поръчки"}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <span className="mr-1.5 h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
            Live Stream
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="formattedDate"
                stroke={textColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval={isHourly ? 1 : "preserveEnd"}
              />
              <YAxis
                stroke={textColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} €`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as RevenueTrend
                    return (
                      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/95 p-3 shadow-xl backdrop-blur-md">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {isHourly ? `Час: ${item.formattedDate}` : `Дата: ${item.formattedDate}`}
                        </p>
                        <p className="mt-1 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(item.revenue)}
                        </p>
                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          {item.orders} {item.orders === 1 ? "поръчка" : "поръчки"}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGradient)"
                activeDot={{ r: 6, stroke: "#818cf8", strokeWidth: 2, fill: isDark ? "#0f172a" : "#ffffff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
