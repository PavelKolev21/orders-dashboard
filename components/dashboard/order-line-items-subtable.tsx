import { WooCommerceLineItem } from "@/types/woocommerce"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { Package } from "lucide-react"

interface OrderLineItemsSubTableProps {
  lineItems: WooCommerceLineItem[]
}

export function OrderLineItemsSubTable({ lineItems }: OrderLineItemsSubTableProps) {
  if (!lineItems || lineItems.length === 0) {
    return (
      <div className="p-4 text-xs italic text-slate-500 dark:text-slate-400">
        Няма намерени артикули за тази поръчка.
      </div>
    )
  }

  const grandTotal = lineItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0)
  const grandTax = lineItems.reduce((sum, item) => sum + (parseFloat(item.total_tax || "0") || 0), 0)

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80 p-4 shadow-inner space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          <Package className="h-4 w-4" />
          <span>АРТИКУЛИ В ПОРЪЧКАТА ({lineItems.length})</span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Общо с ДДС: <span className="font-bold text-indigo-600 dark:text-indigo-300">{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-800/80">
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
            {lineItems.map((item) => (
              <TableRow key={item.id} className="border-b border-slate-200/80 dark:border-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-900/40">
                <TableCell className="py-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                  {item.name}
                </TableCell>
                <TableCell className="py-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                  {item.sku || "N/A"}
                </TableCell>
                <TableCell className="py-2 text-xs text-slate-800 dark:text-slate-200 text-center font-semibold">
                  {item.quantity}
                </TableCell>
                <TableCell className="py-2 text-xs text-slate-600 dark:text-slate-300 text-right font-mono">
                  {formatCurrency(item.price)}
                </TableCell>
                <TableCell className="py-2 text-xs text-slate-500 dark:text-slate-400 text-right font-mono">
                  {formatCurrency(item.total_tax || 0)}
                </TableCell>
                <TableCell className="py-2 text-xs text-indigo-600 dark:text-indigo-300 text-right font-semibold font-mono">
                  {formatCurrency(item.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
