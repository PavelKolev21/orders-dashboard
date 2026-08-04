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

export function formatDate(dateString: string): string {
  try {
    const cleaned = String(dateString).replace(" ", "T")
    const date = new Date(cleaned)
    if (isNaN(date.getTime())) return dateString
    return new Intl.DateTimeFormat("en-GB", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  } catch {
    return dateString
  }
}

export function formatRelativeDate(dateString: string): string {
  try {
    const cleaned = String(dateString).replace(" ", "T")
    const date = new Date(cleaned)
    if (isNaN(date.getTime())) return dateString

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()

    if (diffMs < 0) return formatDate(dateString)

    const diffMin = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffMin < 1) {
      return "Преди малко"
    } else if (diffMin < 60) {
      return `Преди ${diffMin} ${diffMin === 1 ? "минута" : "минути"}`
    } else if (diffHours <= 24) {
      return `Преди ${diffHours} ${diffHours === 1 ? "час" : "часа"}`
    } else {
      return formatDate(dateString)
    }
  } catch {
    return dateString
  }
}
