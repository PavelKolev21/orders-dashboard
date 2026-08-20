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

import { getBulgarianDateString, getPresetDateRange, getBulgarianDateRangeIso } from "@/lib/timezone"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [data, setData] = React.useState<OrdersApiResponse | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [refreshing, setRefreshing] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  
  // Default main theme is LIGHT (white mode)
  const [theme, setTheme] = React.useState<"dark" | "light">("light")

  const initialMonthDates = React.useMemo(() => {
    return getPresetDateRange("this_month")
  }, [])

  // Toggle state to display pending orders in KPI cards
  const [showPending, setShowPending] = React.useState<boolean>(true)

  // Date Range Filtering state (Default: "this_month")
  const [datePreset, setDatePreset] = React.useState<DateRangePreset>("this_month")
  const [startDate, setStartDate] = React.useState<string>(initialMonthDates.start)
  const [endDate, setEndDate] = React.useState<string>(initialMonthDates.end)

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
      if (start || end) {
        const { after, before } = getBulgarianDateRangeIso(start, end)
        if (after) params.append("after", after)
        if (before) params.append("before", before)
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

  // Initial fetch on mount (Default to "This Month")
  React.useEffect(() => {
    fetchOrders(false, initialMonthDates.start, initialMonthDates.end)
  }, [fetchOrders, initialMonthDates])

  // Auto-refresh every 10 minutes to fetch new incoming orders
  React.useEffect(() => {
    const TEN_MINUTES_MS = 10 * 60 * 1000
    const interval = setInterval(() => {
      fetchOrders(true, startDate, endDate)
    }, TEN_MINUTES_MS)

    return () => clearInterval(interval)
  }, [fetchOrders, startDate, endDate])

  // Handle Preset Changes (Today, Yesterday, This Week, L7D, L14D, This Month, L30D, Last Month, All, Custom)
  const handlePresetChange = (preset: DateRangePreset) => {
    setDatePreset(preset)

    if (preset === "custom") {
      return
    }

    if (preset === "all") {
      setStartDate("")
      setEndDate("")
      fetchOrders(false)
      return
    }

    const { start: sStr, end: eStr } = getPresetDateRange(preset)

    setStartDate(sStr)
    setEndDate(eStr)
    fetchOrders(false, sStr, eStr)
  }

  const handleCustomDateChange = (start: string, end: string) => {
    setDatePreset("custom")
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

    const getOrderDayKey = (dateStr: string) => {
      return getBulgarianDateString(dateStr)
    }

    // Filter current period orders
    const currentOrders = allOrders.filter((order) => {
      const orderDay = getOrderDayKey(order.date_created)
      if (!orderDay) return true
      const isAfterStart = startDate ? orderDay >= startDate : true
      const isBeforeEnd = endDate ? orderDay <= endDate : true
      return isAfterStart && isBeforeEnd
    })

    // Calculate previous period equal duration bounds
    let prevOrders: WooCommerceOrder[] = []
    if (startDate && endDate) {
      const [sY, sM, sD] = startDate.split("-").map(Number)
      const [eY, eM, eD] = endDate.split("-").map(Number)
      const startD = new Date(sY, sM - 1, sD)
      const endD = new Date(eY, eM - 1, eD)
      const diffMs = endD.getTime() - startD.getTime()
      const dayMs = 24 * 60 * 60 * 1000
      const durationDays = Math.max(1, Math.round(diffMs / dayMs) + 1)

      const prevEndD = new Date(startD.getTime() - dayMs)
      const prevStartD = new Date(prevEndD.getTime() - (durationDays - 1) * dayMs)

      const formatD = (d: Date) => {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, "0")
        const day = String(d.getDate()).padStart(2, "0")
        return `${y}-${m}-${day}`
      }

      const prevStartStr = formatD(prevStartD)
      const prevEndStr = formatD(prevEndD)

      prevOrders = allOrders.filter((order) => {
        const orderDay = getOrderDayKey(order.date_created)
        if (!orderDay) return false
        return orderDay >= prevStartStr && orderDay <= prevEndStr
      })
    }

    return {
      filteredOrders: currentOrders,
      filteredMetrics: computeDashboardMetrics(currentOrders, prevOrders),
    }
  }, [data, startDate, endDate])

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-400">Зареждане на таблото...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-indigo-500/20 selection:text-indigo-500">
      {/* Top Header Navigation */}
      <DashboardHeader
        isMockData={data ? data.isMockData : true}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8 space-y-6 sm:space-y-8">
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
            <section className="relative z-50">
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                preset={datePreset}
                onPresetChange={handlePresetChange}
                onDateChange={handleCustomDateChange}
                onRefresh={() => fetchOrders(true, startDate, endDate)}
                isRefreshing={refreshing}
                onReset={handleResetDates}
              />
            </section>

            {/* Top-Level Analytics: KPI Cards with Dynamic Comparisons */}
            <section className="relative z-10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Основни метрики (Key Performance Indicators)
                </h2>

                {/* Interactive Toggle for Pending Orders */}
                <label className="inline-flex items-center cursor-pointer gap-2.5 select-none rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 px-3 py-1.5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Показвай поръчки "В очакване"
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showPending}
                    onClick={() => setShowPending(!showPending)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      showPending ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        showPending ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </label>
              </div>

              <KpiCards kpis={filteredMetrics.kpis} showPending={showPending} />
            </section>

            {/* Daily & Monthly Revenue Trends Chart */}
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                График на приходите и продажбите (Revenue Performance)
              </h2>
              <RevenueChart
                data={filteredMetrics.revenueTrends}
                monthlyData={filteredMetrics.monthlyRevenueTrends}
                theme={theme}
              />
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

              <OrdersTable
                data={filteredOrders}
                onRefresh={() => fetchOrders(true, startDate, endDate)}
                isRefreshing={refreshing}
              />
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
