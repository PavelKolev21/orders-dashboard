import { WooCommerceOrder, WooCommerceLineItem } from "@/types/woocommerce"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Package, Tag, Percent, Sparkles } from "lucide-react"

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
      {/* Header and Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
          <Package className="h-4 w-4" />
          <span>АРТИКУЛИ В ПОРЪЧКАТА ({lineItems.length})</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Total Savings Callout Badge if any discounts apply */}
          {totalSavings > 0 && (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              <span>Общо спестени:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalSavings)}
              </span>
            </div>
          )}

          <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400 font-mono">
            <span>Без ДДС: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(netTotal)}</strong></span>
            <span>ДДС: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(orderTax)}</strong></span>
            <span className="pl-2 border-l border-slate-300 dark:border-slate-700">
              Общо с ДДС: <strong className="text-indigo-600 dark:text-indigo-300 font-bold">{formatCurrency(orderTotalWithVat)}</strong>
            </span>
          </div>
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

              // Check for "Брошура" tag/keyword in product name or sku
              const nameLower = (item.name || "").toLowerCase()
              const skuLower = (item.sku || "").toLowerCase()
              const isBrochure = nameLower.includes("брошура") || nameLower.includes("brochure") || skuLower.includes("brochure")

              return (
                <TableRow key={item.id} className="border-b border-slate-200/80 dark:border-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-900/40">
                  <TableCell className="py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200">
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{item.name}</span>
                      
                      {/* Visual Promotional Badges */}
                      {isBrochure && (
                        <Badge variant="warning" className="text-[10px] px-1.5 py-0.5 font-semibold flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          Брошура
                        </Badge>
                      )}

                      {hasDiscount && (
                        <Badge variant="success" className="text-[10px] px-1.5 py-0.5 font-semibold flex items-center gap-1 bg-emerald-600/90 text-white">
                          <Percent className="h-3 w-3" />
                          -{discountPercent}% Промоция
                        </Badge>
                      )}
                    </div>

                    {hasDiscount && (
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                        Спестени {formatCurrency(itemDiscount)} от редовна цена
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
    </div>
  )
}
