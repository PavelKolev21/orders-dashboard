/**
 * Bulgarian Timezone (Europe/Sofia) Utilities
 * Ensures all dates, times, filtering, charts, and API queries are strictly
 * aligned with Bulgarian local time (Europe/Sofia, UTC+2 EET / UTC+3 EEST).
 */

export const BULGARIAN_TIMEZONE = "Europe/Sofia"

/**
 * Helper to parse any order date input (ISO string, date_created, date_created_gmt)
 * into a valid JavaScript Date object representing the exact moment in time.
 */
export function parseOrderDate(dateInput: Date | string | number | null | undefined): Date {
  if (!dateInput) return new Date()
  if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? new Date() : dateInput
  if (typeof dateInput === "number") return new Date(dateInput)

  let cleaned = String(dateInput).trim().replace(" ", "T")
  if (!cleaned.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(cleaned)) {
    cleaned += "Z"
  }
  const d = new Date(cleaned)
  return isNaN(d.getTime()) ? new Date() : d
}

/**
 * Returns YYYY-MM-DD in Europe/Sofia timezone for any given date or date string.
 */
export function getBulgarianDateString(dateInput?: Date | string | number | null): string {
  const d = parseOrderDate(dateInput)
  // en-CA locale formats dates as YYYY-MM-DD
  return d.toLocaleDateString("en-CA", { timeZone: BULGARIAN_TIMEZONE })
}

/**
 * Returns the hour (0 - 23) in Europe/Sofia timezone for a given date.
 */
export function getBulgarianHour(dateInput?: Date | string | number | null): number {
  const d = parseOrderDate(dateInput)
  const hourStr = d.toLocaleTimeString("en-GB", {
    timeZone: BULGARIAN_TIMEZONE,
    hour: "2-digit",
    hour12: false,
  })
  const parsed = parseInt(hourStr, 10)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Returns today's YYYY-MM-DD in Bulgarian local time.
 */
export function getBulgarianTodayString(): string {
  return getBulgarianDateString(new Date())
}

/**
 * Calculates start and end YYYY-MM-DD for standard date presets in Bulgarian timezone.
 */
export function getPresetDateRange(preset: string): { start: string; end: string } {
  const todayStr = getBulgarianTodayString()
  const [y, m, d] = todayStr.split("-").map(Number)
  // Construct Date in local context representing Sofia midnight
  const now = new Date(y, m - 1, d)

  const format = (dt: Date) => dt.toLocaleDateString("en-CA")

  if (preset === "today") {
    return { start: todayStr, end: todayStr }
  }

  if (preset === "yesterday") {
    const prev = new Date(now)
    prev.setDate(now.getDate() - 1)
    const prevStr = format(prev)
    return { start: prevStr, end: prevStr }
  }

  if (preset === "this_week") {
    const dayOfWeek = now.getDay() // Sun=0, Mon=1, ..., Sat=6
    const distanceToMon = (dayOfWeek + 6) % 7
    const monday = new Date(now)
    monday.setDate(now.getDate() - distanceToMon)
    return { start: format(monday), end: todayStr }
  }

  if (preset === "l7d") {
    const start = new Date(now)
    start.setDate(now.getDate() - 6)
    return { start: format(start), end: todayStr }
  }

  if (preset === "l14d") {
    const start = new Date(now)
    start.setDate(now.getDate() - 13)
    return { start: format(start), end: todayStr }
  }

  if (preset === "this_month") {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    return { start: format(firstDay), end: todayStr }
  }

  if (preset === "l30d") {
    const start = new Date(now)
    start.setDate(now.getDate() - 29)
    return { start: format(start), end: todayStr }
  }

  if (preset === "last_month") {
    const firstDayPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDayPrev = new Date(now.getFullYear(), now.getMonth(), 0)
    return { start: format(firstDayPrev), end: format(lastDayPrev) }
  }

  return { start: "", end: "" }
}

/**
 * Returns UTC ISO string bounds for WooCommerce API queries (after/before)
 * corresponding to Bulgarian start of day (00:00:00) and end of day (23:59:59).
 */
export function getBulgarianDateRangeIso(startDateStr?: string, endDateStr?: string): {
  after?: string
  before?: string
} {
  if (!startDateStr && !endDateStr) return {}

  let after: string | undefined
  let before: string | undefined

  if (startDateStr) {
    // Start of Bulgarian day in UTC ISO format: e.g. 2026-08-07T00:00:00 in Sofia -> UTC
    // Using ISO offset notation directly works for WooCommerce API
    // We get offset for Sofia on that date
    const [y, m, d] = startDateStr.split("-").map(Number)
    const testDate = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
    const sofiaHourStr = testDate.toLocaleTimeString("en-GB", {
      timeZone: BULGARIAN_TIMEZONE,
      hour: "2-digit",
      hour12: false,
    })
    const sofiaHour = parseInt(sofiaHourStr, 10)
    const offsetHours = sofiaHour - 12 // e.g. +3 in summer, +2 in winter
    const sign = offsetHours >= 0 ? "+" : "-"
    const absOffset = Math.abs(offsetHours)
    const offsetStr = `${sign}${String(absOffset).padStart(2, "0")}:00`

    after = `${startDateStr}T00:00:00${offsetStr}`
  }

  if (endDateStr) {
    const [y, m, d] = endDateStr.split("-").map(Number)
    const testDate = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
    const sofiaHourStr = testDate.toLocaleTimeString("en-GB", {
      timeZone: BULGARIAN_TIMEZONE,
      hour: "2-digit",
      hour12: false,
    })
    const sofiaHour = parseInt(sofiaHourStr, 10)
    const offsetHours = sofiaHour - 12
    const sign = offsetHours >= 0 ? "+" : "-"
    const absOffset = Math.abs(offsetHours)
    const offsetStr = `${sign}${String(absOffset).padStart(2, "0")}:00`

    before = `${endDateStr}T23:59:59${offsetStr}`
  }

  return { after, before }
}
