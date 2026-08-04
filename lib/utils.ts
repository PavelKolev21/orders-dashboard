import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount.replace(",", ".")) : amount
  if (isNaN(numericAmount)) return "0,00 €"
  
  // Euro formatting standard (e.g. 60,43 € or €60.43)
  const formatted = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount)

  return formatted
}

function parseOrderDate(dateString: string): Date {
  if (!dateString) return new Date()
  let cleaned = String(dateString).trim().replace(" ", "T")
  if (!cleaned.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(cleaned)) {
    cleaned += "Z"
  }
  const d = new Date(cleaned)
  return isNaN(d.getTime()) ? new Date() : d
}

export function formatDate(dateString: string): string {
  try {
    const date = parseOrderDate(dateString)
    return new Intl.DateTimeFormat("en-GB", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  } catch {
    return dateString
  }
}

export function formatRelativeDate(dateString: string): string {
  try {
    const date = parseOrderDate(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()

    if (diffMs < 0) return formatDate(dateString)

    const diffMin = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffMin < 1) {
      return "Преди малко"
    } else if (diffMin <= 59) {
      return `Преди ${diffMin} ${diffMin === 1 ? "минута" : "минути"}`
    } else if (diffHours <= 2) {
      return `Преди ${diffHours} ${diffHours === 1 ? "час" : "часа"}`
    } else {
      // More than 2 hours ago: show exact date and time
      return formatDate(dateString)
    }
  } catch {
    return dateString
  }
}
