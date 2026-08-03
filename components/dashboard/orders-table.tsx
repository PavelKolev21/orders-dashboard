"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  RotateCcw,
  SlidersHorizontal,
  FileText,
  Award,
  PackageCheck,
  Truck,
  Globe,
  RefreshCw,
  Clock,
} from "lucide-react"

import { WooCommerceOrder } from "@/types/woocommerce"
import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { OrderLineItemsSubTable } from "./order-line-items-subtable"

interface OrdersTableProps {
  data: WooCommerceOrder[]
  onRefresh?: () => void
  isRefreshing?: boolean
}

const STORAGE_KEY = "wc_dashboard_column_visibility_v3"

export function OrdersTable({ data, onRefresh, isRefreshing }: OrdersTableProps) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  
  // Default column visibility
  const defaultVisibility: VisibilityState = {
    id: true,
    customer_name: true,
    date_created: true,
    status: true,
    documents: true,
    waybill: true,
    total: true,
    points: true,
    export_status: true,
    tracking_type: true,
    source: true,
    email: false,
    phone: false,
    payment_method: false,
  }

  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(defaultVisibility)
  const [expanded, setExpanded] = React.useState({})
  const isLoadedRef = React.useRef(false)

  // Load column visibility settings from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setColumnVisibility((prev) => ({ ...prev, ...parsed }))
      }
    } catch (e) {
      console.error("Failed to load column visibility from localStorage:", e)
    } finally {
      isLoadedRef.current = true
    }
  }, [])

  // Persist column visibility settings to localStorage
  const handleColumnVisibilityChange = (updater: any) => {
    setColumnVisibility((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        } catch (e) {
          console.error("Failed to save column visibility to localStorage:", e)
        }
      }
      return next
    })
  }

  // Extract unique values for column select filters
  const uniqueValues = React.useMemo(() => {
    const getUnique = (fn: (item: WooCommerceOrder) => string) => {
      const set = new Set<string>()
      data.forEach((item) => {
        const val = fn(item)
        if (val) set.add(val)
      })
      return Array.from(set).sort()
    }

    return {
      status: getUnique((o) => {
        const s = o.status.toLowerCase()
        if (s === "processing" || s === "обработка") return "Обработка"
        if (s === "completed" || s === "приключена") return "Приключена"
        if (s === "pending" || s === "в очакване") return "В очакване"
        if (s === "cancelled" || s === "отказана") return "Отказана"
        if (s === "refunded" || s === "възстановена") return "Възстановена"
        return o.status
      }),
      tracking_type: getUnique((o) => o.tracking_type || "Tag or API"),
      source: getUnique((o) => o.source || "Директна"),
      export_status: getUnique((o) => o.export_status || "—"),
      payment_method: getUnique((o) => o.payment_method_title || o.payment_method || ""),
      waybill: getUnique((o) => o.waybill || "—"),
    }
  }, [data])

  // Define Column Definitions with Select Filters & Separate Order ID & Customer Name
  const columns: ColumnDef<WooCommerceOrder>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 accent-indigo-600 cursor-pointer"
            title="Select all on page"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => {
              e.stopPropagation()
              row.toggleSelected(!!e.target.checked)
            }}
            className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 accent-indigo-600 cursor-pointer"
          />
        ),
        enableHiding: false,
      },
      {
        id: "expander",
        header: () => null,
        cell: ({ row }) => {
          return (
            <button
              onClick={(e) => {
                e.stopPropagation()
                row.toggleExpanded()
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
              title={row.getIsExpanded() ? "Collapse details" : "Expand details"}
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400" />
              )}
            </button>
          )
        },
        enableHiding: false,
      },
      {
        accessorKey: "id",
        header: ({ column }) => {
          const filterValue = (column.getFilterValue() as string) ?? ""
          return (
            <div className="space-y-1 py-1">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Поръчка ID</div>
              <Input
                placeholder="Търсене ID..."
                value={filterValue}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="h-7 text-[11px] px-2 bg-slate-50 dark:bg-slate-950/60 border-slate-300 dark:border-slate-800"
              />
            </div>
          )
        },
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            #{row.original.id}
          </span>
        ),
      },
      {
        id: "customer_name",
        accessorFn: (row) => `${row.billing?.first_name || ""} ${row.billing?.last_name || ""}`.trim(),
        header: ({ column }) => {
          const filterValue = (column.getFilterValue() as string) ?? ""
          return (
            <div className="space-y-1 py-1">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Клиент (Customer)</div>
              <Input
                placeholder="Търсене клиент..."
                value={filterValue}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="h-7 text-[11px] px-2 bg-slate-50 dark:bg-slate-950/60 border-slate-300 dark:border-slate-800"
              />
            </div>
          )
        },
        cell: ({ row }) => {
          const name = `${row.original.billing?.first_name || ""} ${row.original.billing?.last_name || ""}`.trim()
          return (
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
              {name || "Гост"}
            </span>
          )
        },
      },
      {
        accessorKey: "date_created",
        header: ({ column }) => {
          const filterValue = (column.getFilterValue() as string) ?? ""
          return (
            <div className="space-y-1 py-1">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Дата (Date)</div>
              <Input
                placeholder="Търсене дата..."
                value={filterValue}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="h-7 text-[11px] px-2 bg-slate-50 dark:bg-slate-950/60 border-slate-300 dark:border-slate-800"
              />
            </div>
          )
        },
        cell: ({ row }) => {
          const dateStr = row.original.date_created
          const relative = formatRelativeDate(dateStr)
          const exact = formatDate(dateStr)
          return (
            <div className="flex items-center space-x-1.5 whitespace-nowrap text-xs text-slate-700 dark:text-slate-300" title={`Точна дата: ${exact}`}>
              <Clock className="h-3.5 w-3.5 text-indigo-500/80 shrink-0" />
              <span className="font-medium">{relative}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
          const filterValue = (column.getFilterValue() as string) ?? ""
          return (
            <div className="space-y-1 py-1">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Статус (Status)</div>
              <select
                value={filterValue}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="h-7 w-full rounded-md border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-1 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Всички статуси</option>
                {uniqueValues.status.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          )
        },
        cell: ({ row }) => {
          const status = row.original.status.toLowerCase()
          let variant: "success" | "warning" | "info" | "destructive" | "secondary" = "secondary"
          let statusText = status

          if (status === "completed" || status === "приключена") {
            variant = "success"
            statusText = "Приключена"
          } else if (status === "processing" || status === "обработка") {
            variant = "info"
            statusText = "Обработка"
          } else if (status === "pending" || status === "в очакване") {
            variant = "warning"
            statusText = "В очакване"
          } else if (status === "refunded" || status === "възстановена") {
            variant = "secondary"
            statusText = "Възстановена"
          } else if (status === "cancelled" || status === "отказана" || status === "failed") {
            variant = "destructive"
            statusText = "Отказана"
          }

          return (
            <Badge variant={variant} className="text-[11px] py-0.5 font-medium">
              {statusText}
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          if (!value) return true
          const s = row.getValue(id) as string
          return s.toLowerCase().includes(String(value).toLowerCase())
        },
      },
      {
        accessorKey: "documents",
        header: ({ column }) => {
          const filterValue = (column.getFilterValue() as string) ?? ""
          return (
            <div className="space-y-1 py-1">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Документи</div>
              <Input
                placeholder="Филтър док..."
                value={filterValue}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="h-7 text-[11px] px-2 bg-slate-50 dark:bg-slate-950/60 border-slate-300 dark:border-slate-800"
              />
            </div>
          )
        },
        cell: ({ row }) => (
          <div className="flex items-center space-x-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            <FileText className="h-3.5 w-3.5" />
            <span>{row.original.documents || "Поръчка"}</span>
          </div>
        ),
      },
      {
        accessorKey: "waybill",
        header: ({ column }) => {
          const filterValue = (column.getFilterValue() as string) ?? ""
          return (
            <div className="space-y-1 py-1">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Товарителница</div>
              <Input
                placeholder="Товарителница..."
                value={filterValue}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="h-7 text-[11px] px-2 bg-slate-50 dark:bg-slate-950/60 border-slate-300 dark:border-slate-800"
              />
            </div>
          )
        },
        cell: ({ row }) => (
          <span className="text-xs text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">
            {row.original.waybill || "—"}
          </span>
        ),
      },
      {
        accessorKey: "total",
        header: ({ column }) => {
          const filterValue = (column.getFilterValue() as string) ?? ""
          return (
            <div className="space-y-1 py-1 text-right">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Общо (€)</div>
              <Input
                placeholder="Филтър сума..."
                value={filterValue}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="h-7 text-[11px] px-2 bg-slate-50 dark:bg-slate-950/60 border-slate-300 dark:border-slate-800 text-right ml-auto w-24"
              />
            </div>
          )
        },
        cell: ({ row }) => (
          <div className="text-right text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
            {formatCurrency(row.original.total)}
          </div>
        ),
      },
      {
        accessorKey: "points",
        header: ({ column }) => {
          const filterValue = (column.getFilterValue() as string) ?? ""
          return (
            <div className="space-y-1 py-1 text-center">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Points</div>
              <Input
                placeholder="Точки..."
                value={filterValue}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="h-7 text-[11px] px-1 bg-slate-50 dark:bg-slate-950/60 border-slate-300 dark:border-slate-800 text-center mx-auto w-16"
              />
            </div>
          )
        },
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="inline-flex items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-[11px] px-2.5 py-0.5 shadow-sm">
              <Award className="mr-1 h-3 w-3" />
              {row.original.points ?? Math.round(parseFloat(row.original.total) || 0)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "export_status",
        header: ({ column }) => {
          const filterValue = (column.getFilterValue() as string) ?? ""
          return (
            <div className="space-y-1 py-1">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Export Status</div>
              <select
                value={filterValue}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="h-7 w-full rounded-md border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-1 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Всички</option>
                {uniqueValues.export_status.map((es) => (
                  <option key={es} value={es}>
                    {es}
                  </option>
                ))}
              </select>
            </div>
          )
        },
        cell: ({ row }) => (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {row.original.export_status || "—"}
          </span>
        ),
        filterFn: (row, id, value) => {
          if (!value) return true
          return String(row.getValue(id)) === String(value)
        },
      },
      {
        accessorKey: "tracking_type",
        header: ({ column }) => {
          const filterValue = (column.getFilterValue() as string) ?? ""
          return (
            <div className="space-y-1 py-1">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tracking type</div>
              <select
                value={filterValue}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="h-7 w-full rounded-md border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-1 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Всички куриери</option>
                {uniqueValues.tracking_type.map((tt) => (
                  <option key={tt} value={tt}>
                    {tt}
                  </option>
                ))}
              </select>
            </div>
          )
        },
        cell: ({ row }) => (
          <div className="flex items-center space-x-1 text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
            <Truck className="h-3.5 w-3.5 text-sky-500" />
            <span>{row.original.tracking_type || "Tag or API"}</span>
          </div>
        ),
        filterFn: (row, id, value) => {
          if (!value) return true
          return String(row.getValue(id)) === String(value)
        },
      },
      {
        accessorKey: "source",
        header: ({ column }) => {
          const filterValue = (column.getFilterValue() as string) ?? ""
          return (
            <div className="space-y-1 py-1">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Произход (Source)</div>
              <select
                value={filterValue}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="h-7 w-full rounded-md border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-1 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Всички източници</option>
                {uniqueValues.source.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>
          )
        },
        cell: ({ row }) => (
          <div className="flex items-center space-x-1 text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
            <Globe className="h-3.5 w-3.5 text-indigo-500" />
            <span>{row.original.source || "Директна"}</span>
          </div>
        ),
        filterFn: (row, id, value) => {
          if (!value) return true
          return String(row.getValue(id)) === String(value)
        },
      },
      {
        id: "email",
        accessorFn: (row) => row.billing?.email || "",
        header: ({ column }) => {
          const filterValue = (column.getFilterValue() as string) ?? ""
          return (
            <div className="space-y-1 py-1">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email</div>
              <Input
                placeholder="Филтър email..."
                value={filterValue}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="h-7 text-[11px] px-2 bg-slate-50 dark:bg-slate-950/60 border-slate-300 dark:border-slate-800"
              />
            </div>
          )
        },
        cell: ({ row }) => (
          <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
            {row.original.billing?.email || "N/A"}
          </span>
        ),
      },
      {
        id: "phone",
        accessorFn: (row) => row.billing?.phone || "",
        header: ({ column }) => {
          const filterValue = (column.getFilterValue() as string) ?? ""
          return (
            <div className="space-y-1 py-1">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Телефон (Phone)</div>
              <Input
                placeholder="Телефон..."
                value={filterValue}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="h-7 text-[11px] px-2 bg-slate-50 dark:bg-slate-950/60 border-slate-300 dark:border-slate-800"
              />
            </div>
          )
        },
        cell: ({ row }) => (
          <span className="text-xs text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">
            {row.original.billing?.phone || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "payment_method",
        header: ({ column }) => {
          const filterValue = (column.getFilterValue() as string) ?? ""
          return (
            <div className="space-y-1 py-1">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Метод плащане</div>
              <select
                value={filterValue}
                onChange={(e) => column.setFilterValue(e.target.value)}
                className="h-7 w-full rounded-md border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-1 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Всички методи</option>
                {uniqueValues.payment_method.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          )
        },
        cell: ({ row }) => (
          <span className="text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
            {row.original.payment_method_title || row.original.payment_method}
          </span>
        ),
        filterFn: (row, id, value) => {
          if (!value) return true
          const title = row.original.payment_method_title || row.original.payment_method || ""
          return title.toLowerCase().includes(String(value).toLowerCase())
        },
      },
    ],
    [uniqueValues]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      columnFilters,
      columnVisibility,
      expanded,
    },
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  // Get targeted rows: selected rows if any, otherwise all filtered rows
  const getTargetRows = () => {
    const selectedRows = table.getSelectedRowModel().rows
    if (selectedRows.length > 0) return selectedRows
    return table.getFilteredRowModel().rows
  }

  // Export Orders Summary CSV
  const handleExportOrdersSummary = () => {
    const targetRows = getTargetRows()
    if (targetRows.length === 0) {
      alert("Няма намерени поръчки за експорт.")
      return
    }

    const headers = [
      "Order ID",
      "Customer Name",
      "Email",
      "Phone",
      "Date",
      "Status",
      "Total Amount (€)",
      "Points",
      "Waybill",
      "Tracking Type",
      "Source",
      "Payment Method",
    ]

    const csvRows = targetRows.map((row) => {
      const order = row.original
      const name = `${order.billing?.first_name || ""} ${order.billing?.last_name || ""}`.trim()
      return [
        `"#${order.id}"`,
        `"${name.replace(/"/g, '""')}"`,
        `"${(order.billing?.email || "").replace(/"/g, '""')}"`,
        `"${(order.billing?.phone || "").replace(/"/g, '""')}"`,
        `"${formatDate(order.date_created).replace(/"/g, '""')}"`,
        `"${order.status}"`,
        `"${order.total} €"`,
        `"${order.points || 0}"`,
        `"${(order.waybill || "—").replace(/"/g, '""')}"`,
        `"${(order.tracking_type || "").replace(/"/g, '""')}"`,
        `"${(order.source || "").replace(/"/g, '""')}"`,
        `"${(order.payment_method_title || order.payment_method).replace(/"/g, '""')}"`,
      ].join(",")
    })

    const csvContent = [headers.join(","), ...csvRows].join("\n")
    downloadCSV(csvContent, `buldent_orders_summary_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  // Export Orders By Products (Line Items) CSV
  const handleExportOrdersByProducts = () => {
    const targetRows = getTargetRows()
    if (targetRows.length === 0) {
      alert("Няма намерени поръчки за експорт.")
      return
    }

    const headers = [
      "Order ID",
      "Order Date",
      "Customer Name",
      "Customer Email",
      "Product Name",
      "SKU / Code",
      "Quantity",
      "Unit Price (€)",
      "Tax (€)",
      "Line Total (€)",
      "Order Total (€)",
      "Status",
      "Tracking Type",
      "Source",
    ]

    const csvRows: string[] = []

    targetRows.forEach((row) => {
      const order = row.original
      const customerName = `${order.billing?.first_name || ""} ${order.billing?.last_name || ""}`.trim()

      if (order.line_items && order.line_items.length > 0) {
        order.line_items.forEach((item) => {
          csvRows.push(
            [
              `"#${order.id}"`,
              `"${formatDate(order.date_created)}"`,
              `"${customerName.replace(/"/g, '""')}"`,
              `"${(order.billing?.email || "").replace(/"/g, '""')}"`,
              `"${item.name.replace(/"/g, '""')}"`,
              `"${(item.sku || "N/A").replace(/"/g, '""')}"`,
              `"${item.quantity}"`,
              `"${item.price} €"`,
              `"${item.total_tax || "0"} €"`,
              `"${item.total} €"`,
              `"${order.total} €"`,
              `"${order.status}"`,
              `"${(order.tracking_type || "").replace(/"/g, '""')}"`,
              `"${(order.source || "").replace(/"/g, '""')}"`,
            ].join(",")
          )
        })
      } else {
        csvRows.push(
          [
            `"#${order.id}"`,
            `"${formatDate(order.date_created)}"`,
            `"${customerName.replace(/"/g, '""')}"`,
            `"${(order.billing?.email || "").replace(/"/g, '""')}"`,
            `"N/A"`,
            `"N/A"`,
            `"0"`,
            `"0 €"`,
            `"0 €"`,
            `"0 €"`,
            `"${order.total} €"`,
            `"${order.status}"`,
            `"${(order.tracking_type || "").replace(/"/g, '""')}"`,
            `"${(order.source || "").replace(/"/g, '""')}"`,
          ].join(",")
        )
      }
    })

    const csvContent = [headers.join(","), ...csvRows].join("\n")
    downloadCSV(csvContent, `buldent_orders_by_products_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob(["\ufeff" + content], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const columnLabelMap: Record<string, string> = {
    id: "Поръчка ID",
    customer_name: "Клиент (Customer)",
    date_created: "Дата (Date)",
    status: "Статус (Status)",
    documents: "Документи",
    waybill: "Товарителница",
    total: "Общо (€)",
    points: "Points",
    export_status: "Export Status",
    tracking_type: "Tracking type",
    source: "Произход (Source)",
    email: "Email",
    phone: "Телефон",
    payment_method: "Метод плащане",
  }

  const selectedCount = Object.keys(rowSelection).length
  const isFiltered = columnFilters.length > 0

  return (
    <div className="space-y-4">
      {/* Action Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            <span>
              Показване на {table.getFilteredRowModel().rows.length} от {data.length} поръчки
            </span>
            {selectedCount > 0 && (
              <span className="ml-2 font-semibold text-indigo-600 dark:text-indigo-400">
                ({selectedCount} избрани)
              </span>
            )}
          </div>

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.resetColumnFilters()}
              className="h-7 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              Изчисти филтри
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Secondary / Local Table Refresh Data Button */}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-9 text-xs font-semibold border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
              title="Обнови данните за поръчките в избрания период"
            >
              <RefreshCw
                className={`mr-1.5 h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
              Обнови поръчките
            </Button>
          )}

          {/* Column Toggle Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" size="sm" className="h-9 text-xs">
                <Eye className="mr-1.5 h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                Колони (Columns)
                <ChevronDown className="ml-1.5 h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Избор на колони</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {columnLabelMap[column.id] || column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs font-semibold border-indigo-300 dark:border-indigo-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5 text-indigo-500" />
                <span>Експорт</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>Избор на формат за експорт</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleExportOrdersSummary}
                className="cursor-pointer text-xs py-2 flex items-center gap-2"
              >
                <Download className="h-4 w-4 text-indigo-500 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Експорт поръчки (Обобщено)</div>
                  <div className="text-[11px] text-slate-400">CSV с данни за клиента, статус и суми</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleExportOrdersByProducts}
                className="cursor-pointer text-xs py-2 flex items-center gap-2"
              >
                <PackageCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Експорт по продукти</div>
                  <div className="text-[11px] text-slate-400">CSV с детайли за всеки продукт & SKU</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/70 shadow-lg dark:shadow-2xl overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="align-top py-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer transition-colors hover:bg-slate-100/60 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800/60"
                    onClick={() => row.toggleExpanded()}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Expandable Sub-table Row */}
                  {row.getIsExpanded() && (
                    <TableRow className="bg-slate-50 dark:bg-slate-950/90 hover:bg-slate-50 dark:hover:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800/80">
                      <TableCell colSpan={row.getVisibleCells().length} className="p-4 bg-slate-50/70 dark:bg-slate-950/60">
                        <OrderLineItemsSubTable order={row.original} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-xs text-slate-500 dark:text-slate-400"
                >
                  Няма намерени поръчки според зададените филтри.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
        <div>
          Страница {table.getState().pagination.pageIndex + 1} от{" "}
          {table.getPageCount() || 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 text-xs"
          >
            Предишна
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 text-xs"
          >
            Следваща
          </Button>
        </div>
      </div>
    </div>
  )
}
