import { Euro, ShoppingBag, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
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
  }
}

export function KpiCards({ kpis }: KpiCardsProps) {
  const formatChange = (val?: number) => {
    if (val === undefined || isNaN(val)) return { change: "0.0%", isPositive: true }
    const isPositive = val >= 0
    const formatted = `${isPositive ? "+" : ""}${val.toFixed(1)}%`
    return { change: formatted, isPositive }
  }

  const revChange = formatChange(kpis.revenueChange)
  const ordChange = formatChange(kpis.ordersChange)
  const aovChange = formatChange(kpis.aovChange)

  const cards = [
    {
      title: "Общо приходи (Total Revenue)",
      value: formatCurrency(kpis.totalRevenue),
      subtitle: "Оборот от поръчки в €",
      change: revChange.change,
      isPositive: revChange.isPositive,
      icon: Euro,
      gradient: "from-indigo-500/10 to-indigo-500/0",
      iconBg: "bg-indigo-500/15 border-indigo-500/30 text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Брой поръчки (Total Orders)",
      value: kpis.totalOrders.toLocaleString(),
      subtitle: "Обработени & приключени",
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
            className="relative overflow-hidden bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 shadow-md dark:shadow-xl"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.gradient} pointer-events-none opacity-60`}
            />
            <CardContent className="p-6">
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
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
