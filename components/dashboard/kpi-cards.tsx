import { Euro, ShoppingBag, TrendingUp, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface KpiCardsProps {
  kpis: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    revenueChange?: number
    ordersChange?: number
    aovChange?: number
    pendingRevenue?: number
    pendingOrdersCount?: number
    pendingAOV?: number
  }
  showPending?: boolean
}

export function KpiCards({ kpis, showPending = true }: KpiCardsProps) {
  const formatChange = (val?: number) => {
    if (val === undefined || isNaN(val)) return { change: "0.0%", isPositive: true }
    const isPositive = val >= 0
    const formatted = `${isPositive ? "+" : ""}${val.toFixed(1)}%`
    return { change: formatted, isPositive }
  }

  const revChange = formatChange(kpis.revenueChange)
  const ordChange = formatChange(kpis.ordersChange)
  const aovChange = formatChange(kpis.aovChange)

  const pendingRev = kpis.pendingRevenue || 0
  const pendingCount = kpis.pendingOrdersCount || 0
  const pendingAov = kpis.pendingAOV || 0

  const cards = [
    {
      title: "Общо приходи (Total Revenue)",
      value: formatCurrency(kpis.totalRevenue),
      subtitle: "Обработени & приключени поръчки",
      pendingSubtext: `+ ${formatCurrency(pendingRev)} в очакване (${pendingCount} ${pendingCount === 1 ? "поръчка" : "поръчки"})`,
      change: revChange.change,
      isPositive: revChange.isPositive,
      icon: Euro,
      gradient: "from-indigo-500/10 to-indigo-500/0",
      iconBg: "bg-indigo-500/15 border-indigo-500/30 text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Брой поръчки (Total Orders)",
      value: kpis.totalOrders.toLocaleString(),
      subtitle: "Обработени & приключени поръчки",
      pendingSubtext: `+ ${pendingCount} ${pendingCount === 1 ? "поръчка" : "поръчки"} в очакване`,
      change: ordChange.change,
      isPositive: ordChange.isPositive,
      icon: ShoppingBag,
      gradient: "from-emerald-500/10 to-emerald-500/0",
      iconBg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Средна стойност (AOV)",
      value: formatCurrency(kpis.averageOrderValue),
      subtitle: "Средна поръчка на клиент",
      pendingSubtext: `В очакване средна: ${formatCurrency(pendingAov)}`,
      change: aovChange.change,
      isPositive: aovChange.isPositive,
      icon: TrendingUp,
      gradient: "from-sky-500/10 to-sky-500/0",
      iconBg: "bg-sky-500/15 border-sky-500/30 text-sky-600 dark:text-sky-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <Card
            key={idx}
            className="relative overflow-hidden bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 shadow-md dark:shadow-xl flex flex-col justify-between"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.gradient} pointer-events-none opacity-60`}
            />
            <CardContent className="p-6 flex flex-col flex-1 justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {card.title}
                  </span>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border ${card.iconBg} shadow-inner`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {card.value}
                  </div>
                  <div
                    className={`flex items-center text-xs font-semibold ${
                      card.isPositive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {card.isPositive ? (
                      <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />
                    )}
                    {card.change}
                  </div>
                </div>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{card.subtitle}</p>
              </div>

              {showPending && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                    <span>{card.pendingSubtext}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
