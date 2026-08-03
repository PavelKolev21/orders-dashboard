import { WooCommerceOrder, WooCommerceLineItem } from "@/types/woocommerce"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Package, Tag, Sparkles, TrendingDown, BookOpen, Zap } from "lucide-react"

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

  // Calculate total savings: difference between regular_price & unit price + item discounts + order coupon discount
  const totalSavings = lineItems.reduce((sum, item) => {
    const unitP = parseFloat(item.price as any) || 0
    const regP = item.regular_price ? parseFloat(String(item.regular_price)) : 0
    const sub = parseFloat(item.subtotal) || 0
    const tot = parseFloat(item.total) || 0
    const lineDiff = Math.max(0, sub - tot)
    const qty = item.quantity || 1

    if (regP > unitP) {
      return sum + (regP - unitP) * qty
    }
    return sum + lineDiff
  }, 0) + (parseFloat(order.discount_total || "0") || 0)

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
              const unitPrice = parseFloat(item.price as any) || 0
              const regularPrice = item.regular_price ? parseFloat(String(item.regular_price)) : 0
              const salePrice = item.sale_price ? parseFloat(String(item.sale_price)) : 0
              const subtotal = parseFloat(item.subtotal) || 0
              const total = parseFloat(item.total) || 0
              const itemDiscount = Math.max(0, subtotal - total)

              // Check if product is on sale (sale price set, regular price > unit price, on_sale === true, or item discount)
              const isOnSale =
                item.on_sale === true ||
                (regularPrice > 0 && regularPrice > unitPrice) ||
                (regularPrice > 0 && salePrice > 0 && regularPrice > salePrice) ||
                itemDiscount > 0

              const unitDiscount = regularPrice > unitPrice ? regularPrice - unitPrice : itemDiscount / (item.quantity || 1)
              const discountPercent =
                regularPrice > 0 && regularPrice > unitPrice
                  ? Math.round(((regularPrice - unitPrice) / regularPrice) * 100)
                  : subtotal > 0 && itemDiscount > 0
                  ? Math.round((itemDiscount / subtotal) * 100)
                  : 0

              // Tags inspection (Product tags from WooCommerce API)
              const tagsArr = Array.isArray(item.tags) ? item.tags : []
              const tagLowerArr = tagsArr.map((t) => String(t).toLowerCase())
              const nameLower = (item.name || "").toLowerCase()
              const skuLower = (item.sku || "").toLowerCase()
              const metaValues = (item.meta_data || []).map((m: any) => String(m.value || "").toLowerCase()).join(" ")

              const isBrochure =
                tagLowerArr.some((t) => t.includes("брошура") || t.includes("brochure")) ||
                nameLower.includes("брошура") ||
                nameLower.includes("brochure") ||
                skuLower.includes("brochure") ||
                metaValues.includes("брошура")

              const isLimitedOffer =
                tagLowerArr.some((t) => t.includes("лимитиран") || t.includes("limited") || t.includes("оферта")) ||
                nameLower.includes("лимитиран") ||
                nameLower.includes("limited") ||
                skuLower.includes("limited") ||
                metaValues.includes("лимитиран")

              // Other custom product tags (excluding brochure/limited already highlighted)
              const otherTags = tagsArr.filter(
                (t) => !t.toLowerCase().includes("брошура") && !t.toLowerCase().includes("лимитиран")
              )

              return (
                <TableRow key={item.id} className="border-b border-slate-200/80 dark:border-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-900/40">
                  <TableCell className="py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span>{item.name}</span>
                      
                      {/* 1. Reduced Sale Price Marker */}
                      {isOnSale && (
                        <Badge className="text-[10px] px-1.5 py-0.5 font-semibold flex items-center gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                          <TrendingDown className="h-3 w-3 text-rose-500" />
                          Намалена цена {discountPercent > 0 ? `(-${discountPercent}%)` : ""}
                        </Badge>
                      )}

                      {/* 2. "Брошура" Tag Marker */}
                      {isBrochure && (
                        <Badge className="text-[10px] px-1.5 py-0.5 font-semibold flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          <BookOpen className="h-3 w-3 text-amber-500" />
                          Брошура
                        </Badge>
                      )}

                      {/* 3. "Лимитирани предложения" Tag Marker */}
                      {isLimitedOffer && (
                        <Badge className="text-[10px] px-1.5 py-0.5 font-semibold flex items-center gap-1 bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                          <Zap className="h-3 w-3 text-purple-500" />
                          Лимитирани предложения
                        </Badge>
                      )}

                      {/* Other product tags */}
                      {otherTags.slice(0, 2).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-[9px] px-1.5 py-0 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700">
                          <Tag className="h-2.5 w-2.5 mr-0.5 text-slate-400" />
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Show Regular Price vs Unit Sale Price detail if on sale */}
                    {isOnSale && regularPrice > unitPrice && (
                      <div className="text-[11px] text-rose-600 dark:text-rose-400 font-mono mt-0.5 flex items-center gap-1.5">
                        <span className="line-through text-slate-400 font-normal">{formatCurrency(regularPrice)}</span>
                        <span>➔</span>
                        <span className="font-semibold">{formatCurrency(unitPrice)}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans">
                          (спестени {formatCurrency(unitDiscount * (item.quantity || 1))})
                        </span>
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
                    {regularPrice > unitPrice ? (
                      <div>
                        <span className="line-through text-slate-400 text-[10px] block">{formatCurrency(regularPrice)}</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">{formatCurrency(unitPrice)}</span>
                      </div>
                    ) : (
                      formatCurrency(unitPrice)
                    )}
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
