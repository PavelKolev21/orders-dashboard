import { WooCommerceOrder, WooCommerceLineItem } from "@/types/woocommerce"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Package, TrendingDown, BookOpen, Zap } from "lucide-react"

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

  // Calculate total savings: sum of real sale discounts + order coupon discounts
  const totalSavings = lineItems.reduce((sum, item) => {
    const qty = item.quantity || 1
    const regP = item.regular_price ? parseFloat(String(item.regular_price)) : 0
    const saleP = item.sale_price ? parseFloat(String(item.sale_price)) : 0
    const sub = parseFloat(item.subtotal) || 0
    const tot = parseFloat(item.total) || 0
    const itemDiscount = Math.max(0, sub - tot)

    if (regP > 0 && saleP > 0 && regP > saleP) {
      return sum + (regP - saleP) * qty
    } else if (itemDiscount > 0) {
      return sum + itemDiscount
    }
    return sum
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
              const qty = item.quantity || 1
              const netSubtotal = parseFloat(item.subtotal) || 0
              const netTotalItem = parseFloat(item.total) || 0
              const itemTax = parseFloat(item.total_tax || "0") || 0
              const itemDiscount = Math.max(0, netSubtotal - netTotalItem)

              // Gross Unit Price (with 20% VAT)
              const grossUnitPrice = (netTotalItem + itemTax) / qty

              // Product API pricing attributes
              const regularPrice = item.regular_price ? parseFloat(String(item.regular_price)) : 0
              const salePrice = item.sale_price ? parseFloat(String(item.sale_price)) : 0

              // Product is truly on sale ONLY if regular_price > sale_price or itemDiscount > 0
              const isRealSale =
                (regularPrice > 0 && salePrice > 0 && regularPrice > salePrice) ||
                (item.on_sale === true && regularPrice > 0 && salePrice > 0 && regularPrice > salePrice) ||
                itemDiscount > 0

              let discountPercent = 0
              if (regularPrice > 0 && salePrice > 0 && regularPrice > salePrice) {
                discountPercent = Math.round(((regularPrice - salePrice) / regularPrice) * 100)
              } else if (netSubtotal > 0 && itemDiscount > 0) {
                discountPercent = Math.round((itemDiscount / netSubtotal) * 100)
              }

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

              return (
                <TableRow key={item.id} className="border-b border-slate-200/80 dark:border-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-900/40">
                  <TableCell className="py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span>{item.name}</span>
                      
                      {/* 1. Compact Sale Price Badge (-XX%) */}
                      {isRealSale && discountPercent > 0 && (
                        <Badge className="text-[10px] px-1.5 py-0.5 font-semibold flex items-center gap-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                          <TrendingDown className="h-3 w-3 text-rose-500" />
                          <span>-{discountPercent}%</span>
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
                    </div>
                  </TableCell>

                  <TableCell className="py-2.5 text-xs font-mono text-slate-500 dark:text-slate-400">
                    {item.sku || "N/A"}
                  </TableCell>
                  <TableCell className="py-2.5 text-xs text-slate-800 dark:text-slate-200 text-center font-semibold">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="py-2.5 text-xs text-slate-600 dark:text-slate-300 text-right font-mono">
                    {isRealSale && regularPrice > 0 && salePrice > 0 && regularPrice > salePrice ? (
                      <div>
                        <span className="line-through text-slate-400 text-[10px] block">{formatCurrency(regularPrice)}</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">{formatCurrency(salePrice)}</span>
                      </div>
                    ) : (
                      formatCurrency(grossUnitPrice)
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

      {/* Footer Totals Summary (Below Table) */}
      <div className="flex justify-end pt-1">
        <div className="flex flex-wrap items-center space-x-3 text-xs text-slate-600 dark:text-slate-400 font-mono bg-white/80 dark:bg-slate-900/80 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <span>Без ДДС: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(netTotal)}</strong></span>
          <span>ДДС: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(orderTax)}</strong></span>
          {totalSavings > 0 && (
            <span className="pl-2 border-l border-slate-300 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-semibold">
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
