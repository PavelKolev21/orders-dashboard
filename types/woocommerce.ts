export interface WooCommerceBilling {
  first_name: string;
  last_name: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  email: string;
  phone: string;
}

export interface WooCommerceShipping {
  first_name: string;
  last_name: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export interface WooCommerceLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id?: number;
  quantity: number;
  tax_class?: string;
  subtotal: string;
  subtotal_tax?: string;
  total: string;
  total_tax?: string;
  sku?: string;
  price: number;
  meta_data?: { id: number; key: string; value: any }[];
}

export interface WooCommerceOrder {
  id: number;
  parent_id?: number;
  status: "pending" | "processing" | "on-hold" | "completed" | "cancelled" | "refunded" | "failed" | string;
  currency: string;
  version?: string;
  prices_include_tax?: boolean;
  date_created: string;
  date_modified?: string;
  discount_total?: string;
  discount_tax?: string;
  shipping_total?: string;
  shipping_tax?: string;
  cart_tax?: string;
  total: string;
  total_tax?: string;
  customer_id?: number;
  order_key?: string;
  billing: WooCommerceBilling;
  shipping: WooCommerceShipping;
  payment_method: string;
  payment_method_title: string;
  tracking_type?: string;
  source?: string;
  points?: number;
  documents?: string;
  waybill?: string;
  export_status?: string;
  device_type?: string;
  specialist_id?: string;
  transaction_id?: string;
  customer_ip_address?: string;
  customer_user_agent?: string;
  created_via?: string;
  customer_note?: string;
  date_completed?: string | null;
  date_paid?: string | null;
  line_items: WooCommerceLineItem[];
}

export interface OrdersApiResponse {
  success: boolean;
  data: WooCommerceOrder[];
  isMockData: boolean;
  totalCount: number;
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    revenueChange?: number;
    ordersChange?: number;
    aovChange?: number;
  };
  revenueTrends: {
    date: string;
    formattedDate: string;
    revenue: number;
    orders: number;
  }[];
  error?: string;
}
