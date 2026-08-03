"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { WooCommerceOrder, OrdersApiResponse } from "@/types/woocommerce"
import { computeDashboardMetrics } from "@/lib/woocommerce"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DateRangePicker, DateRangePreset } from "@/components/dashboard/date-range-picker"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { OrdersTable } from "@/components/dashboard/orders-table"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [data, setData] = React.useState<OrdersApiResponse | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [refreshing, setRefreshing] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  
  // Default main theme is LIGHT (white mode)
  const [theme, setTheme] = React.useState<"dark" | "light">("light")

  // Date Range Filtering state
  const [datePreset, setDatePreset] = React.useState<DateRangePreset>("all")
  const [startDate, setStartDate] = React.useState<string>("")
  const [endDate, setEndDate] = React.useState<string>("")

  // Authentication check & redirect
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login")
    }
  }, [user, authLoading, router])


  // Sync theme class on <html> element
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

  const fetchOrders = React.useCallback(async (isRefresh = false, start?: string, end?: string) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      let url = "/api/orders"
      const params = new URLSearchParams()
      if (start) {
        params.append("after", `${start}T00:00:00Z`)
      }
      if (end) {
        params.append("before", `${end}T23:59:59Z`)
      }
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }
      const json: OrdersApiResponse = await res.json()
      if (!json.success) {
        throw new Error(json.error || "Failed to load orders")
      }
      setData(json)
    } catch (err) {
      console.error("Dashboard fetch error:", err)
      setError(err instanceof Error ? err.message : "Failed to load orders data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial fetch on mount
  React.useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Handle Preset Changes (L7D, L14D, L30D, All)
  const handlePresetChange = (preset: DateRangePreset) => {
    setDatePreset(preset)
    const today = new Date()
    
    if (preset === "all") {
      setStartDate("")
      setEndDate("")
      fetchOrders(false)
      return
    }

    let daysToSubtract = 7
    if (preset === "l14d") daysToSubtract = 14
    else if (preset === "l30d") daysToSubtract = 30

    const start = new Date(today)
    start.setDate(today.getDate() - daysToSubtract)

    const sStr = start.toISOString().slice(0, 10)
    const eStr = today.toISOString().slice(0, 10)

    setStartDate(sStr)
    setEndDate(eStr)
    fetchOrders(false, sStr, eStr)
  }

  const handleCustomDateChange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
    if (start || end) {
      fetchOrders(false, start, end)
    } else {
      fetchOrders(false)
    }
  }

  const handleResetDates = () => {
    setDatePreset("all")
    setStartDate("")
    setEndDate("")
    fetchOrders(false)
  }

  // Filter orders & calculate dynamic period comparison metrics
  const { filteredOrders, filteredMetrics } = React.useMemo(() => {
    if (!data?.data) {
      return {
        filteredOrders: [],
        filteredMetrics: computeDashboardMetrics([]),
      }
    }

    const allOrders = data.data

    if (!startDate && !endDate) {
      // Split allOrders into first half vs second half for trend comparison if "All Time"
      const totalLen = allOrders.length
      const half = Math.floor(totalLen / 2)
      const currentHalf = allOrders.slice(0, half)
      const previousHalf = allOrders.slice(half)
      return {
        filteredOrders: allOrders,
        filteredMetrics: computeDashboardMetrics(allOrders, previousHalf),
      }
    }

    const startMs = startDate ? new Date(startDate).getTime() : 0
    const endObj = endDate ? new Date(endDate) : new Date()
    endObj.setHours(23, 59, 59, 999)
    const endMs = endObj.getTime()

    // Filter current period orders
    const currentOrders = allOrders.filter((order) => {
      const orderMs = new Date(order.date_created).getTime()
      const isAfterStart = startMs ? orderMs >= startMs : true
      const isBeforeEnd = endMs ? orderMs <= endMs : true
      return isAfterStart && isBeforeEnd
    })

    // Calculate previous period equal duration bounds
    const durationMs = endMs - (startMs || (endMs - 30 * 24 * 60 * 60 * 1000))
    const prevEndMs = startMs || (endMs - durationMs)
    const prevStartMs = prevEndMs - durationMs

    const prevOrders = allOrders.filter((order) => {
      const orderMs = new Date(order.date_created).getTime()
      return orderMs >= prevStartMs && orderMs < prevEndMs
    })

    return {
      filteredOrders: currentOrders,
      filteredMetrics: computeDashboardMetrics(currentOrders, prevOrders),
    }
  }, [data, startDate, endDate])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-400">Проверка на сесията...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-indigo-500/20 selection:text-indigo-500">
      {/* Top Header Navigation */}
      <DashboardHeader
        isMockData={data ? data.isMockData : true}
        onRefresh={() => fetchOrders(true, startDate, endDate)}
        isRefreshing={refreshing}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {loading ? (
          <div className="flex h-96 flex-col items-center justify-center space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40 shadow-xl">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Зареждане на поръчки и анализи от WooCommerce...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-rose-500/20 bg-rose-500/10 space-y-3">
            <AlertCircle className="h-8 w-8 text-rose-500 dark:text-rose-400" />
            <h3 className="text-base font-semibold text-rose-800 dark:text-rose-200">Грешка при зареждане на данните</h3>
            <p className="text-xs text-rose-600 dark:text-rose-300 max-w-md">{error}</p>
            <button
              onClick={() => fetchOrders(false, startDate, endDate)}
              className="mt-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition-colors"
            >
              Опитай отново
            </button>
          </div>
        ) : data ? (
          <>
            {/* Calendar & Preset Date Range Picker */}
            <section>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                preset={datePreset}
                onPresetChange={handlePresetChange}
                onDateChange={handleCustomDateChange}
                onReset={handleResetDates}
              />
            </section>

            {/* Top-Level Analytics: KPI Cards with Dynamic Comparisons */}
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Основни метрики (Key Performance Indicators)
              </h2>
              <KpiCards kpis={filteredMetrics.kpis} />
            </section>

            {/* Daily Revenue Trends Chart */}
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Дневни приходи и продажби (Revenue Performance)
              </h2>
              <RevenueChart data={filteredMetrics.revenueTrends} theme={theme} />
            </section>

            {/* Interactive TanStack Orders Data Table Grid */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Регистър поръчки WooCommerce
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Филтрирайте по колони, избирайте поръчки за експорт (обобщено или по продукти) или преглеждайте подробности.
                  </p>
                </div>
              </div>

              <OrdersTable data={filteredOrders} />
            </section>
          </>
        ) : null}
      </main>

      {/* Dashboard Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/60 bg-white/60 dark:bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>WooCommerce Orders Analytics & Data Grid Engine</span>
          <span>Next.js App Router • TanStack Table • Recharts • Tailwind CSS</span>
        </div>
      </footer>
    </div>
  )
}
