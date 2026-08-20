import { MOCK_ORDERS } from "@/lib/mock-data"
import { WooCommerceOrder, OrdersApiResponse } from "@/types/woocommerce"
import { getBulgarianDateString, getBulgarianHour, parseOrderDate } from "@/lib/timezone"

function parseTotal(total: any): number {
  if (!total) return 0
  const str = String(total).replace(",", ".")
  const val = parseFloat(str)
  return isNaN(val) ? 0 : val
}

function getDateKey(dateCreated: any): string {
  return getBulgarianDateString(dateCreated)
}

export function isPrimaryStatus(status?: string): boolean {
  if (!status) return false
  const s = status.toLowerCase().trim()
  return s === "processing" || s === "completed" || s === "обработка" || s === "приключена"
}

export function isPendingStatus(status?: string): boolean {
  if (!status) return false
  const s = status.toLowerCase().trim()
  return s === "pending" || s === "on-hold" || s === "в очакване" || s === "на изчакване"
}

export function computeDashboardMetrics(
  orders: WooCommerceOrder[],
  prevPeriodOrders?: WooCommerceOrder[]
) {
  // Primary KPI metrics: strictly "обработка" (processing) & "приключена" (completed)
  const primaryOrders = orders.filter((o) => o && isPrimaryStatus(o.status))

  // Pending metrics: "в очакване" (pending / on-hold)
  const pendingOrders = orders.filter((o) => o && isPendingStatus(o.status))

  const totalRevenue = primaryOrders.reduce((sum, order) => {
    return sum + parseTotal(order.total)
  }, 0)

  const totalOrders = primaryOrders.length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const pendingRevenue = pendingOrders.reduce((sum, order) => {
    return sum + parseTotal(order.total)
  }, 0)

  const pendingOrdersCount = pendingOrders.length
  const pendingAOV = pendingOrdersCount > 0 ? pendingRevenue / pendingOrdersCount : 0

  let revenueChange = 0
  let ordersChange = 0
  let aovChange = 0

  if (prevPeriodOrders && prevPeriodOrders.length > 0) {
    const prevPrimary = prevPeriodOrders.filter((o) => o && isPrimaryStatus(o.status))
    const prevRevenue = prevPrimary.reduce((sum, order) => {
      return sum + parseTotal(order.total)
    }, 0)
    const prevOrders = prevPrimary.length
    const prevAOV = prevOrders > 0 ? prevRevenue / prevOrders : 0

    if (prevRevenue > 0) {
      revenueChange = ((totalRevenue - prevRevenue) / prevRevenue) * 100
    }
    if (prevOrders > 0) {
      ordersChange = ((totalOrders - prevOrders) / prevOrders) * 100
    }
    if (prevAOV > 0) {
      aovChange = ((averageOrderValue - prevAOV) / prevAOV) * 100
    }
  }

  const sortedOrders = [...orders].sort((a, b) => {
    const tA = a.date_created ? parseOrderDate(a.date_created).getTime() : 0
    const tB = b.date_created ? parseOrderDate(b.date_created).getTime() : 0
    return tA - tB
  })

  const uniqueDates = Array.from(new Set(sortedOrders.map((o) => getDateKey(o.date_created))))
  const isSingleDay = uniqueDates.length <= 1

  let revenueTrends: { date: string; formattedDate: string; revenue: number; orders: number }[] = []

  if (isSingleDay) {
    const mapHourRevenue: Record<number, { revenue: number; orders: number }> = {}
    for (let h = 0; h < 24; h++) {
      mapHourRevenue[h] = { revenue: 0, orders: 0 }
    }

    sortedOrders.forEach((order) => {
      const hour = getBulgarianHour(order.date_created)
      const amount = parseTotal(order.total)

      if (isPrimaryStatus(order.status)) {
        mapHourRevenue[hour].revenue += amount
        mapHourRevenue[hour].orders += 1
      }
    })

    revenueTrends = Object.entries(mapHourRevenue).map(([hStr, data]) => {
      const h = parseInt(hStr, 10)
      const formattedHour = `${String(h).padStart(2, "0")}:00`
      return {
        date: formattedHour,
        formattedDate: formattedHour,
        revenue: parseFloat(data.revenue.toFixed(2)),
        orders: data.orders,
      }
    })
  } else {
    const mapDateRevenue: Record<string, { revenue: number; orders: number }> = {}

    sortedOrders.forEach((order) => {
      const dateKey = getDateKey(order.date_created)
      const amount = parseTotal(order.total)

      if (!mapDateRevenue[dateKey]) {
        mapDateRevenue[dateKey] = { revenue: 0, orders: 0 }
      }
      if (isPrimaryStatus(order.status)) {
        mapDateRevenue[dateKey].revenue += amount
        mapDateRevenue[dateKey].orders += 1
      }
    })

    // Fill in any missing dates in the range between min and max date
    const dateKeys = Object.keys(mapDateRevenue).sort()
    if (dateKeys.length > 0) {
      const [minY, minM, minD] = dateKeys[0].split("-").map(Number)
      const [maxY, maxM, maxD] = dateKeys[dateKeys.length - 1].split("-").map(Number)
      
      const curr = new Date(minY, minM - 1, minD)
      const last = new Date(maxY, maxM - 1, maxD)
      
      while (curr <= last) {
        const y = curr.getFullYear()
        const m = String(curr.getMonth() + 1).padStart(2, "0")
        const d = String(curr.getDate()).padStart(2, "0")
        const key = `${y}-${m}-${d}`
        if (!mapDateRevenue[key]) {
          mapDateRevenue[key] = { revenue: 0, orders: 0 }
        }
        curr.setDate(curr.getDate() + 1)
      }
    }

    const sortedMapEntries = Object.entries(mapDateRevenue).sort(([a], [b]) => a.localeCompare(b))

    revenueTrends = sortedMapEntries.map(([dateKey, data]) => {
      const [y, m, dNum] = dateKey.split("-").map(Number)
      const d = new Date(y, m - 1, dNum)
      const formattedDate = isNaN(d.getTime())
        ? dateKey
        : d.toLocaleDateString("en-GB", { month: "short", day: "numeric" })
      return {
        date: dateKey,
        formattedDate,
        revenue: parseFloat(data.revenue.toFixed(2)),
        orders: data.orders,
      }
    })
  }

  // Monthly Revenue Trends aggregation
  const mapMonthRevenue: Record<string, { revenue: number; orders: number }> = {}

  sortedOrders.forEach((order) => {
    const dateKey = getDateKey(order.date_created)
    if (!dateKey || dateKey.length < 7) return
    const monthKey = dateKey.substring(0, 7) // "YYYY-MM"
    const amount = parseTotal(order.total)

    if (!mapMonthRevenue[monthKey]) {
      mapMonthRevenue[monthKey] = { revenue: 0, orders: 0 }
    }

    if (isPrimaryStatus(order.status)) {
      mapMonthRevenue[monthKey].revenue += amount
      mapMonthRevenue[monthKey].orders += 1
    }
  })

  const BG_MONTHS: Record<string, string> = {
    "01": "Ян", "02": "Фев", "03": "Мар", "04": "Апр",
    "05": "Май", "06": "Юни", "07": "Юли", "08": "Авг",
    "09": "Сеп", "10": "Окт", "11": "Ное", "12": "Дек"
  }

  const monthlyRevenueTrends = Object.entries(mapMonthRevenue)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, data]) => {
      const [y, m] = monthKey.split("-")
      const monthName = BG_MONTHS[m] || m
      const formattedDate = `${monthName} ${y}`
      return {
        date: monthKey,
        formattedDate,
        revenue: parseFloat(data.revenue.toFixed(2)),
        orders: data.orders,
      }
    })

  return {
    kpis: {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      revenueChange: parseFloat(revenueChange.toFixed(1)),
      ordersChange: parseFloat(ordersChange.toFixed(1)),
      aovChange: parseFloat(aovChange.toFixed(1)),
      pendingRevenue: parseFloat(pendingRevenue.toFixed(2)),
      pendingOrdersCount,
      pendingAOV: parseFloat(pendingAOV.toFixed(2)),
    },
    revenueTrends,
    monthlyRevenueTrends,
  }
}

interface FetchOrdersOptions {
  after?: string
  before?: string
  perPage?: number
}

export async function getWooCommerceOrders(options: FetchOrdersOptions = {}): Promise<OrdersApiResponse> {
  const storeUrl = process.env.WC_STORE_URL
  const consumerKey = process.env.WC_CONSUMER_KEY
  const consumerSecret = process.env.WC_CONSUMER_SECRET

  const isConfigured =
    storeUrl &&
    consumerKey &&
    consumerSecret &&
    !storeUrl.includes("example-store.com") &&
    !consumerKey.includes("placeholder") &&
    !consumerSecret.includes("placeholder")

  if (!isConfigured) {
    const metrics = computeDashboardMetrics(MOCK_ORDERS)
    return {
      success: true,
      data: MOCK_ORDERS,
      isMockData: true,
      totalCount: MOCK_ORDERS.length,
      ...metrics,
    }
  }

  try {
    const cleanUrl = storeUrl.replace(/\/$/, "")
    const authHeader = `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")}`

    let rawOrders: any[] = []
    const perPageVal = options.perPage || 100

    let page1Url = `${cleanUrl}/wp-json/wc/v3/orders?per_page=${perPageVal}&page=1&status=any`
    if (options.after) {
      page1Url += `&after=${encodeURIComponent(options.after)}`
    }
    if (options.before) {
      page1Url += `&before=${encodeURIComponent(options.before)}`
    }

    const res1 = await fetch(page1Url, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(15000),
      next: { revalidate: 60 },
    })

    if (!res1.ok) {
      throw new Error(`WooCommerce API Status: ${res1.status}`)
    }

    const totalPagesHeader = res1.headers.get("x-wp-totalpages")
    const totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 1
    const page1Data: any[] = await res1.json()
    rawOrders = [...page1Data]

    const maxPagesToFetch = Math.min(totalPages, 50)

    if (maxPagesToFetch > 1) {
      const pagePromises = []
      for (let p = 2; p <= maxPagesToFetch; p++) {
        let pageUrl = `${cleanUrl}/wp-json/wc/v3/orders?per_page=${perPageVal}&page=${p}&status=any`
        if (options.after) {
          pageUrl += `&after=${encodeURIComponent(options.after)}`
        }
        if (options.before) {
          pageUrl += `&before=${encodeURIComponent(options.before)}`
        }

        pagePromises.push(
          fetch(pageUrl, {
            method: "GET",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
            signal: AbortSignal.timeout(15000),
            next: { revalidate: 60 },
          })
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => [])
        )
      }

      const pagesResults = await Promise.all(pagePromises)
      pagesResults.forEach((pData) => {
        if (Array.isArray(pData)) {
          rawOrders = rawOrders.concat(pData)
        }
      })
    }

    // Batch fetch WooCommerce Product details (regular_price, sale_price, on_sale, tags) for all line items
    const productIds = new Set<number>()
    rawOrders.forEach((o: any) => {
      ;(o.line_items || []).forEach((li: any) => {
        if (li.product_id) productIds.add(li.product_id)
      })
    })

    const productMap = new Map<
      number,
      { regular_price?: string; sale_price?: string; on_sale?: boolean; tags?: string[] }
    >()

    if (productIds.size > 0) {
      const idsArr = Array.from(productIds)
      for (let i = 0; i < idsArr.length; i += 100) {
        const chunk = idsArr.slice(i, i + 100)
        try {
          const pRes = await fetch(`${cleanUrl}/wp-json/wc/v3/products?include=${chunk.join(",")}&per_page=100`, {
            method: "GET",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
            signal: AbortSignal.timeout(10000),
            next: { revalidate: 300 },
          })
          if (pRes.ok) {
            const pList: any[] = await pRes.json()
            pList.forEach((p: any) => {
              productMap.set(p.id, {
                regular_price: p.regular_price,
                sale_price: p.sale_price,
                on_sale: p.on_sale,
                tags: Array.isArray(p.tags) ? p.tags.map((t: any) => t.name) : [],
              })
            })
          }
        } catch (pErr) {
          console.log("[WooCommerce API] Product details fetch skipped/timed out:", pErr)
        }
      }
    }

    const liveOrders: WooCommerceOrder[] = rawOrders.map((order: any) => {
      const meta = order.meta_data || []
      const getMeta = (key: string) => meta.find((m: any) => m.key === key)?.value

      const pointsVal = getMeta("_points_earned") || getMeta("_order_points") || Math.round(parseFloat(order.total) || 0)
      const waybillVal = getMeta("_speedy_bill_no") || getMeta("_econt_bill_no") || getMeta("_tracking_number") || order.shipping_lines?.[0]?.method_title || "—"
      const trackingTypeVal = getMeta("_tracking_type") || order.shipping_lines?.[0]?.method_title || "Tag or API"
      const exportStatusVal = getMeta("_export_status") || "Tag or API"

      const utmSource = getMeta("_wc_order_attribution_utm_source") || getMeta("_utm_source") || getMeta("utm_source")
      const sourceType = getMeta("_wc_order_attribution_source_type")
      const referrer = getMeta("_wc_order_attribution_referrer")
      
      let pysSource = ""
      const pysRaw = getMeta("pys_enrich_data")
      if (pysRaw) {
        try {
          const parsed = typeof pysRaw === "string" ? JSON.parse(pysRaw) : pysRaw
          pysSource = parsed.last_pys_source || parsed.pys_source || ""
        } catch {}
      }

      const src = String(utmSource || pysSource || "").toLowerCase()
      let sourceLabel = "Директна"

      if (src === "releva" || src.includes("releva")) {
        sourceLabel = "Източник: Releva"
      } else if (src === "google" || src.includes("google") || (referrer && String(referrer).includes("google"))) {
        if (sourceType === "organic" || src.includes("organic")) {
          sourceLabel = "Органични: Google"
        } else {
          sourceLabel = "Източник: Google"
        }
      } else if (src.includes("mail") || (referrer && String(referrer).includes("mail.bg"))) {
        sourceLabel = "Препоръка: Mail.bg"
      } else if (src.includes("bing") || (referrer && String(referrer).includes("bing"))) {
        sourceLabel = "Препоръка: Bing.com"
      } else if (src === "banner" || src.includes("banner")) {
        sourceLabel = "Източник: Banner"
      } else if (src === "(direct)" || src === "direct" || sourceType === "typein" || sourceType === "direct") {
        sourceLabel = "Директна"
      } else if (utmSource && utmSource !== "(direct)") {
        sourceLabel = `Източник: ${utmSource}`
      }

      // Enrich line items with product regular_price, sale_price, on_sale, and tags
      const enrichedLineItems = (order.line_items || []).map((li: any) => {
        const pInfo = productMap.get(li.product_id) || {}
        return {
          ...li,
          regular_price: pInfo.regular_price || li.regular_price,
          sale_price: pInfo.sale_price || li.sale_price,
          on_sale: typeof pInfo.on_sale === "boolean" ? pInfo.on_sale : li.on_sale,
          tags: pInfo.tags && pInfo.tags.length > 0 ? pInfo.tags : li.tags || [],
        }
      })

      const rawDate = order.date_created_gmt || order.date_created || ""
      const cleanDate = rawDate
        ? rawDate.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(rawDate)
          ? rawDate
          : `${rawDate}Z`
        : order.date_created

      return {
        ...order,
        date_created: cleanDate,
        total: String(order.total || "0"),
        line_items: enrichedLineItems,
        tracking_type: trackingTypeVal,
        source: sourceLabel,
        points: typeof pointsVal === "number" ? pointsVal : parseInt(String(pointsVal)) || 0,
        documents: `Поръчка #${order.id}`,
        waybill: waybillVal,
        export_status: exportStatusVal,
      }
    })

    const metrics = computeDashboardMetrics(liveOrders)

    return {
      success: true,
      data: liveOrders,
      isMockData: false,
      totalCount: liveOrders.length,
      ...metrics,
    }
  } catch (error) {
    console.log("[WooCommerce API] Fallback to mock data:", error instanceof Error ? error.message : String(error))
    const metrics = computeDashboardMetrics(MOCK_ORDERS)
    return {
      success: true,
      data: MOCK_ORDERS,
      isMockData: true,
      totalCount: MOCK_ORDERS.length,
      ...metrics,
    }
  }
}
