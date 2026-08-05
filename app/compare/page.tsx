"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { OrdersApiResponse, WooCommerceOrder } from "@/types/woocommerce"
import {
  PeriodConfig,
  getPresetPeriods,
  computeMultiPeriodComparison,
} from "@/lib/comparison"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PeriodSelector } from "@/components/comparison/period-selector"
import { MultiPeriodChart } from "@/components/comparison/multi-period-chart"
import { SourceActivityComparison } from "@/components/comparison/source-activity-comparison"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { RefreshCw, AlertCircle, TrendingUp, TrendingDown, ShoppingBag, Euro, Award } from "lucide-react"

export default function ComparePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [data, setData] = React.useState<OrdersApiResponse | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)

  // Default theme
  const [theme, setTheme] = React.useState<"dark" | "light">("light")

  // Comparison Periods state (Default: This Month vs Last Month)
  const defaultPreset = React.useMemo(() => getPresetPeriods()[0], [])
  const [periods, setPeriods] = React.useState<PeriodConfig[]>(defaultPreset.periods)

  // Auth Redirect Guard
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login")
    }
  }, [user, authLoading, router])

  // Sync theme class
  React.useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }

  // Fetch all orders
  const fetchAllOrders = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/orders", { cache: "no-store" })
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }
      const json: OrdersApiResponse = await res.json()
      if (!json.success) {
        throw new Error(json.error || "Failed to load orders")
      }
      setData(json)
    } catch (err) {
      console.error("Compare page fetch error:", err)
      setError(err instanceof Error ? err.message : "Failed to load orders data")
    } font-sans finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchAllOrders()
  }, [fetchAllOrders])

  // Compute Multi-Period Comparison metrics
  const comparisonResult = React.useMemo(() => {
    if (!data?.data) {
      return computeMultiPeriodComparison([], periods)
    }
    return computeMultiPeriodComparison(data.data, periods)
  }, [data, periods])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-400">Проверка на сесията...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation Header */}
      <DashboardHeader
        isMockData={data ? data.isMockData : true}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Page Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Сравнение на периоди и анализи
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Съпоставете 2 или повече периода на една графика и анализирайте активността по източници.
            </p>
          </div>

          <button
            onClick={fetchAllOrders}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Обнови данните
          </button>
        </div>

        {loading ? (
          <div className="flex h-96 flex-col items-center justify-center space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40 shadow-xl">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Генериране на сравнителен анализ за избраните периоди...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-rose-500/20 bg-rose-500/10 space-y-3">
            <AlertCircle className="h-8 w-8 text-rose-500 dark:text-rose-400" />
            <h3 className="text-base font-semibold text-rose-800 dark:text-rose-200">Грешка при зареждане</h3>
            <p className="text-xs text-rose-600 dark:text-rose-300 max-w-md">{error}</p>
            <button
              onClick={fetchAllOrders}
              className="mt-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition-colors"
            >
              Опитай отново
            </button>
          </div>
        ) : (
          <>
            {/* 1. Period Selector & Preset Picker */}
            <section className="relative z-20">
              <PeriodSelector periods={periods} onChange={setPeriods} />
            </section>

            {/* 2. KPI Period Totals Comparison Summary Cards */}
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Обобщени метрики по периоди
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comparisonResult.periodSummaries.map((s, idx) => {
                  // Calculate growth relative to previous period in array
                  const prevSummary = comparisonResult.periodSummaries[idx + 1]
                  let growth: number | null = null
                  if (prevSummary && prevSummary.totalRevenue > 0) {
                    growth = parseFloat(
                      (
                        ((s.totalRevenue - prevSummary.totalRevenue) / prevSummary.totalRevenue) *
                        100
                      ).toFixed(1)
                    )
                  }

                  return (
                    <Card
                      key={s.period.id}
                      className="bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800/90 shadow-md relative overflow-hidden"
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-1.5"
                        style={{ backgroundColor: s.period.color }}
                      />
                      <CardContent className="pt-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full shrink-0"
                              style={{ backgroundColor: s.period.color }}
                            />
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {s.period.label}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {s.period.startDate} - {s.period.endDate}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Euro className="h-3 w-3 text-indigo-500" />
                              Приходи
                            </span>
                            <div className="text-lg font-black text-slate-900 dark:text-white">
                              {formatCurrency(s.totalRevenue)}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <ShoppingBag className="h-3 w-3 text-indigo-500" />
                              Поръчки
                            </span>
                            <div className="text-lg font-black text-slate-900 dark:text-white">
                              {s.totalOrders}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800/60 pt-3 text-xs">
                          <span className="text-slate-500 dark:text-slate-400">Средна стойност (AOV):</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {formatCurrency(s.averageOrderValue)}
                          </span>
                        </div>

                        {growth !== null && (
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-slate-500">Промяна спрямо минал период:</span>
                            <span
                              className={`inline-flex items-center gap-1 font-bold ${
                                growth >= 0 ? "text-emerald-500" : "text-rose-500"
                              }`}
                            >
                              {growth >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                              {growth >= 0 ? `+${growth}%` : `${growth}%`}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </section>

            {/* 3. Single Graphic Overlay Chart */}
            <section className="space-y-3">
              <MultiPeriodChart
                periods={periods}
                data={comparisonResult.chartPoints}
                theme={theme}
              />
            </section>

            {/* 4. Activity Per Source Comparison Breakdown */}
            <section className="space-y-3">
              <SourceActivityComparison
                periodSummaries={comparisonResult.periodSummaries}
                sourceRows={comparisonResult.sourceRows}
                periods={periods}
                theme={theme}
              />
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/60 bg-white/60 dark:bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>WooCommerce Orders Multi-Period Comparison Engine</span>
          <span>Next.js App Router • Recharts Multi-Series</span>
        </div>
      </footer>
    </div>
  )
}
