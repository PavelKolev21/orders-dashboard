import { NextResponse, NextRequest } from "next/server"
import { getWooCommerceOrders, computeDashboardMetrics } from "@/lib/woocommerce"
import { MOCK_ORDERS } from "@/lib/mock-data"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const after = searchParams.get("after") || undefined
    const before = searchParams.get("before") || undefined
    const perPage = searchParams.get("per_page") ? parseInt(searchParams.get("per_page")!, 10) : undefined

    const result = await getWooCommerceOrders({ after, before, perPage })
    return NextResponse.json(result)
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") {
      throw error
    }
    console.error("API /api/orders fallback:", error)
    const metrics = computeDashboardMetrics(MOCK_ORDERS)
    return NextResponse.json({
      success: true,
      data: MOCK_ORDERS,
      isMockData: true,
      totalCount: MOCK_ORDERS.length,
      error: error instanceof Error ? error.message : "Internal API error, using mock data",
      ...metrics,
    })
  }
}
