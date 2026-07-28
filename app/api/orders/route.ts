import { NextResponse, NextRequest } from "next/server"
import { getWooCommerceOrders } from "@/lib/woocommerce"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const after = searchParams.get("after") || undefined
    const before = searchParams.get("before") || undefined
    const perPage = searchParams.get("per_page") ? parseInt(searchParams.get("per_page")!, 10) : undefined

    const result = await getWooCommerceOrders({ after, before, perPage })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    )
  }
}
