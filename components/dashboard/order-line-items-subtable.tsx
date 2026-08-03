import { WooCommerceOrder, WooCommerceLineItem } from "@/types/woocommerce"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Package, Tag, Percent, Sparkles, TrendingDown, BookOpen, Zap } from "lucide-react"

interface OrderLineItemsSubTableProps {
  order: WooCommerceOrder
}

export function OrderLineItemsSubTable({ order }: OrderLineItemsSubTableProps) {
  const lineItems = order.line_items || []
  if (!lineItems || lineItems.length === 0) {
    return (
      <div className="p-4 text-xs italic text-slate-500 dark:text-slate-400">
        Няма намерени артикули за тази поръчка.
      </div>
    )
  }

  // Exact Order Total with VAT (from order.total, matching the folded order row)
  const orderTotalWithVat = parseFloat(order.total) || 0
  const orderTax = parseFloat(order.total_tax || "0") || lineItems.reduce((s, i) => s + (parseFloat(i.total_tax || "0") || 0), 0)
  const netTotal = Math.max(0, orderTotalWithVat - orderTax)

  // Calculate item-level discounts
  const itemDiscounts = lineItems.reduce((sum, item) => {
    const sub = parseFloat(item.subtotal) || 0
    const tot = parseFloat(item.total) || 0
    return sum + Math.max(0, sub - tot)
  }, 0)

  // Order-level discount
  const orderDiscount = parseFloat(order.discount_total || "0") || 0
  const totalSavings = itemDiscounts + orderDiscount

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80 p-4 shadow-inner space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
          <Package className="h-4 w-4" />
          <span>АРТИКУЛИ В ПОРЪЧКАТА ({lineItems.length})</span>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800/80">
        <Table>
          <TableHeader className="bg-slate-100/90 dark:bg-slate-900/80">
            <TableRow className="border-b border-slate-200 dark:border-slate-800">
              <TableHead className="py-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Продукт (Product Name)</TableHead>
              <TableHead className="py-2 text-xs font-semibold text-slate-700 dark:text-slate-300">SKU / Код</TableHead>
              <TableHead className="py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">Количество (Qty)</TableHead>
              <TableHead className="py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 text-right">Ед. цена (Price)</TableHead>
              <TableHead className="py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 text-right">ДДС (Tax)</TableHead>
              <TableHead className="py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 text-right">Общо (Total)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((item) => {
              const subtotal = parseFloat(item.subtotal) || 0
              const total = parseFloat(item.total) || 0
              const itemDiscount = Math.max(0, subtotal - total)
              const hasDiscount = itemDiscount > 0
              const discountPercent = subtotal > 0 && hasDiscount ? Math.round((itemDiscount / subtotal) * 100) : 0

              const nameLower = (item.name || "").toLowerCase()
              const skuLower = (item.sku || "").toLowerCase()
              const metaValues = (item.meta_data || []).map((m: any) => String(m.value || "").toLowerCase()).join(" ")

              // Tag / Campaign Detection
              const isBrochure =
                nameLower.includes("брошура") ||
                nameLower.includes("brochure") ||
                skuLower.includes("brochure") ||
                metaValues.includes("брошура") ||
                metaValues.includes("brochure")

              const isLimitedOffer =
                nameLower.includes("лимитиран") ||
                nameLower.includes("limited") ||
                skuLower.includes("limited") ||
                metaValues.includes("лимитиран") ||
                metaValues.includes("limited") ||
                metaValues.includes("промоция") ||
                metaValues.includes("promo")

              return (
                <TableRow key={item.id} className="border-b border-slate-200/80 dark:border-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-900/40">
                  <TableCell className="py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span>{item.name}</span>
                      
                      {/* Reduced Sale Price Marker */}
                      {hasDiscount && (
                        <Badge className="text-[10px] px-1.5 py-0.5 font-semibold flex items-center gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                          <TrendingDown className="h-3 w-3 text-rose-500" />
                          Намалена цена {discountPercent > 0 ? `(-${discountPercent}%)` : ""}
                        </Badge>
                      )}

                      {/* "Брошура" Tag Marker */}
                      {isBrochure && (
                        <Badge className="text-[10px] px-1.5 py-0.5 font-semibold flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          <BookOpen className="h-3 w-3 text-amber-500" />
                          Брошура
                        </Badge>
                      )}

                      {/* "Лимитирани предложения" Tag Marker */}
                      {isLimitedOffer && (
                        <Badge className="text-[10px] px-1.5 py-0.5 font-semibold flex items-center gap-1 bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                          <Zap className="h-3 w-3 text-purple-500" />
                          Лимитирани предложения
                        </Badge>
                      )}
                    </div>

                    {hasDiscount && (
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                        Спестени {formatCurrency(itemDiscount)} от редовната цена
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="py-2.5 text-xs font-mono text-slate-500 dark:text-slate-400">
                    {item.sku || "N/A"}
                  </TableCell>
                  <TableCell className="py-2.5 text-xs text-slate-800 dark:text-slate-200 text-center font-semibold">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="py-2.5 text-xs text-slate-600 dark:text-slate-300 text-right font-mono">
                    {formatCurrency(item.price)}
                  </TableCell>
                  <TableCell className="py-2.5 text-xs text-slate-500 dark:text-slate-400 text-right font-mono">
                    {formatCurrency(item.total_tax || 0)}
                  </TableCell>
                  <TableCell className="py-2.5 text-xs text-indigo-600 dark:text-indigo-300 text-right font-semibold font-mono">
                    {formatCurrency(item.total)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Footer Totals & Discount Summary (Below Table) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Total Discount Callout Badge */}
        {totalSavings > 0 ? (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm text-xs font-mono">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            <span>Сумарна отстъпка:</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              -{formatCurrency(totalSavings)}
            </strong>
          </div>
        ) : (
          <div />
        )}

        {/* Totals Breakdown */}
        <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-400 font-mono bg-white/80 dark:bg-slate-900/80 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <span>Без ДДС: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(netTotal)}</strong></span>
          <span>ДДС: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(orderTax)}</strong></span>
          {totalSavings > 0 && (
            <span className="pl-2 border-l border-slate-300 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">
              Отстъпка: <strong>-{formatCurrency(totalSavings)}</strong>
            </span>
          )}
          <span className="pl-2 border-l border-slate-300 dark:border-slate-700">
            Общо с ДДС: <strong className="text-indigo-600 dark:text-indigo-300 font-bold text-sm">{formatCurrency(orderTotalWithVat)}</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
