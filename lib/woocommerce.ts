import { MOCK_ORDERS } from "@/lib/mock-data"
import { WooCommerceOrder, OrdersApiResponse } from "@/types/woocommerce"

export function computeDashboardMetrics(
  orders: WooCommerceOrder[],
  prevPeriodOrders?: WooCommerceOrder[]
) {
  const validOrders = orders.filter(
    (o) => o.status !== "cancelled" && o.status !== "failed" && o.status !== "отказана"
  )

  const totalRevenue = validOrders.reduce((sum, order) => {
    const val = parseFloat(order.total.replace(",", "."))
    return sum + (isNaN(val) ? 0 : val)
  }, 0)

  const totalOrders = orders.length
  const averageOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0

  let revenueChange = 0
  let ordersChange = 0
  let aovChange = 0

  if (prevPeriodOrders && prevPeriodOrders.length > 0) {
    const validPrev = prevPeriodOrders.filter(
      (o) => o.status !== "cancelled" && o.status !== "failed" && o.status !== "отказана"
    )
    const prevRevenue = validPrev.reduce((sum, order) => {
      const val = parseFloat(order.total.replace(",", "."))
      return sum + (isNaN(val) ? 0 : val)
    }, 0)
    const prevOrders = prevPeriodOrders.length
    const prevAOV = validPrev.length > 0 ? prevRevenue / validPrev.length : 0

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

  // Process chronologically
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
  )

  // Check unique calendar dates present in orders
  const uniqueDates = Array.from(
    new Set(sortedOrders.map((o) => o.date_created.split("T")[0] || o.date_created.substring(0, 10)))
  )

  const isSingleDay = uniqueDates.length <= 1

  let revenueTrends: { date: string; formattedDate: string; revenue: number; orders: number }[] = []

  if (isSingleDay) {
    // 24-Hour Breakdown for 1-day view
    const mapHourRevenue: Record<number, { revenue: number; orders: number }> = {}
    for (let h = 0; h < 24; h++) {
      mapHourRevenue[h] = { revenue: 0, orders: 0 }
    }

    sortedOrders.forEach((order) => {
      const d = new Date(order.date_created)
      const hour = isNaN(d.getTime()) ? 0 : d.getHours()
      const amount = parseFloat(order.total.replace(",", ".")) || 0

      if (order.status !== "cancelled" && order.status !== "failed" && order.status !== "отказана") {
        mapHourRevenue[hour].revenue += amount
      }
      mapHourRevenue[hour].orders += 1
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
    // Daily Breakdown for multi-day views
    const mapDateRevenue: Record<string, { revenue: number; orders: number }> = {}

    sortedOrders.forEach((order) => {
      const dateKey = order.date_created.split("T")[0] || order.date_created.substring(0, 10)
      const amount = parseFloat(order.total.replace(",", ".")) || 0

      if (!mapDateRevenue[dateKey]) {
        mapDateRevenue[dateKey] = { revenue: 0, orders: 0 }
      }
      if (order.status !== "cancelled" && order.status !== "failed" && order.status !== "отказана") {
        mapDateRevenue[dateKey].revenue += amount
      }
      mapDateRevenue[dateKey].orders += 1
    })

    revenueTrends = Object.entries(mapDateRevenue).map(([date, data]) => {
      const d = new Date(date)
      const formattedDate = isNaN(d.getTime())
        ? date
        : d.toLocaleDateString("en-GB", { month: "short", day: "numeric" })
      return {
        date,
        formattedDate,
        revenue: parseFloat(data.revenue.toFixed(2)),
        orders: data.orders,
      }
    })
  }

  return {
    kpis: {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      revenueChange: parseFloat(revenueChange.toFixed(1)),
      ordersChange: parseFloat(ordersChange.toFixed(1)),
      aovChange: parseFloat(aovChange.toFixed(1)),
    },
    revenueTrends,
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

    // Fetch page 1 first to get total pages header
    let page1Url = `${cleanUrl}/wp-json/wc/v3/orders?per_page=${perPageVal}&page=1`
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
      next: { revalidate: 60 },
    })

    if (!res1.ok) {
      throw new Error(`WooCommerce API Error: ${res1.status} ${res1.statusText}`)
    }

    const totalPagesHeader = res1.headers.get("x-wp-totalpages")
    const totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 1
    const page1Data: any[] = await res1.json()
    rawOrders = [...page1Data]

    // Fetch remaining pages in parallel (up to 50 pages / 5,000 orders max for high speed)
    const maxPagesToFetch = Math.min(totalPages, 50)

    if (maxPagesToFetch > 1) {
      const pagePromises = []
      for (let p = 2; p <= maxPagesToFetch; p++) {
        let pageUrl = `${cleanUrl}/wp-json/wc/v3/orders?per_page=${perPageVal}&page=${p}`
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

    const liveOrders: WooCommerceOrder[] = rawOrders.map((order: any) => {
      const meta = order.meta_data || []
      const getMeta = (key: string) => meta.find((m: any) => m.key === key)?.value

      const pointsVal = getMeta("_points_earned") || getMeta("_order_points") || Math.round(parseFloat(order.total) || 0)
      const waybillVal = getMeta("_speedy_bill_no") || getMeta("_econt_bill_no") || getMeta("_tracking_number") || order.shipping_lines?.[0]?.method_title || "—"
      const trackingTypeVal = getMeta("_tracking_type") || order.shipping_lines?.[0]?.method_title || "Tag or API"
      const exportStatusVal = getMeta("_export_status") || "Tag or API"

      // Order Source Extraction (WooCommerce Order Attribution & PixelYourSite)
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

      return {
        ...order,
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
    console.error("Failed to fetch live WooCommerce orders, falling back to mock data:", error)
    const metrics = computeDashboardMetrics(MOCK_ORDERS)
    return {
      success: true,
      data: MOCK_ORDERS,
      isMockData: true,
      totalCount: MOCK_ORDERS.length,
      error: error instanceof Error ? error.message : "Failed to fetch live orders",
      ...metrics,
    }
  }
}
