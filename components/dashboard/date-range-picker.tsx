"use client"

import * as React from "react"
import {
  Calendar as CalendarIcon,
  RotateCcw,
  RefreshCw,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type DateRangePreset =
  | "all"
  | "today"
  | "yesterday"
  | "this_week"
  | "l7d"
  | "l14d"
  | "this_month"
  | "l30d"
  | "last_month"
  | "custom"

interface DateRangePickerProps {
  startDate: string
  endDate: string
  preset: DateRangePreset
  onPresetChange: (preset: DateRangePreset) => void
  onDateChange: (startDate: string, endDate: string) => void
  onRefresh?: () => void
  isRefreshing?: boolean
  onReset: () => void
}

import { getBulgarianTodayString } from "@/lib/timezone"

const MONTH_NAMES_BG = [
  "Януари",
  "Февруари",
  "Март",
  "Април",
  "Май",
  "Юни",
  "Юли",
  "Август",
  "Септември",
  "Октомври",
  "Ноември",
  "Декември",
]

const WEEKDAYS_BG = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"]
const MAX_DATE = getBulgarianTodayString()

export function DateRangePicker({
  startDate,
  endDate,
  preset,
  onPresetChange,
  onDateChange,
  onRefresh,
  isRefreshing = false,
  onReset,
}: DateRangePickerProps) {
  const [localStart, setLocalStart] = React.useState(startDate)
  const [localEnd, setLocalEnd] = React.useState(endDate)
  const [hoverDate, setHoverDate] = React.useState<string | null>(null)

  // Current calendar view month/year
  const [viewDate, setViewDate] = React.useState<Date>(() => {
    if (endDate) return new Date(endDate)
    return new Date()
  })

  React.useEffect(() => {
    setLocalStart(startDate)
    setLocalEnd(endDate)
    if (endDate) {
      const d = new Date(endDate)
      if (!isNaN(d.getTime())) setViewDate(d)
    }
  }, [startDate, endDate])

  const presets: { id: DateRangePreset; label: string }[] = [
    { id: "all", label: "Всички (All Time)" },
    { id: "today", label: "Днес (Today)" },
    { id: "yesterday", label: "Вчера (Yesterday)" },
    { id: "this_week", label: "Тази седмица (This Week)" },
    { id: "l7d", label: "Последни 7 дни" },
    { id: "l14d", label: "Последни 14 дни" },
    { id: "this_month", label: "Този месец (This Month)" },
    { id: "l30d", label: "Последни 30 дни" },
    { id: "last_month", label: "Миналия месец (Last Month)" },
  ]

  const formattedRangeDisplay = React.useMemo(() => {
    if (preset === "all" && !startDate && !endDate) {
      return "Всички времена (All Time)"
    }
    if (startDate && endDate) {
      return `${startDate.split("-").reverse().join(".")} – ${endDate.split("-").reverse().join(".")}`
    }
    if (startDate) return `От ${startDate.split("-").reverse().join(".")}`
    if (endDate) return `До ${endDate.split("-").reverse().join(".")}`

    const activeP = presets.find((p) => p.id === preset)
    return activeP ? activeP.label : "Изберете период"
  }, [startDate, endDate, preset, presets])

  // Calendar Grid Calculation for Monday-first layout
  const calendarDays = React.useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Monday-based index: Mon=0, Tue=1, ..., Sun=6
    const startDayOfWeek = (firstDay.getDay() + 6) % 7
    const daysInMonth = lastDay.getDate()

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = []

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthLastDay - i
      const pMonth = month === 0 ? 11 : month - 1
      const pYear = month === 0 ? year - 1 : year
      const mm = String(pMonth + 1).padStart(2, "0")
      const dd = String(pDay).padStart(2, "0")
      days.push({ dateStr: `${pYear}-${mm}-${dd}`, dayNum: pDay, isCurrentMonth: false })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const mm = String(month + 1).padStart(2, "0")
      const dd = String(i).padStart(2, "0")
      days.push({ dateStr: `${year}-${mm}-${dd}`, dayNum: i, isCurrentMonth: true })
    }

    // Next month padding
    const remaining = (7 - (days.length % 7)) % 7
    for (let i = 1; i <= remaining; i++) {
      const nMonth = month === 11 ? 0 : month + 1
      const nYear = month === 11 ? year + 1 : year
      const mm = String(nMonth + 1).padStart(2, "0")
      const dd = String(i).padStart(2, "0")
      days.push({ dateStr: `${nYear}-${mm}-${dd}`, dayNum: i, isCurrentMonth: false })
    }

    return days
  }, [viewDate])

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleDayClick = (dateStr: string) => {
    if (dateStr > MAX_DATE) return
    if (!localStart || (localStart && localEnd)) {
      setLocalStart(dateStr)
      setLocalEnd("")
    } else if (localStart && !localEnd) {
      if (dateStr < localStart) {
        setLocalStart(dateStr)
        setLocalEnd("")
      } else {
        setLocalEnd(dateStr)
        onPresetChange("custom")
        onDateChange(localStart, dateStr)
      }
    }
  }

  const handleApply = () => {
    const start = localStart || localEnd
    const end = localEnd || localStart
    if (start && end) {
      const finalStart = start <= end ? start : end
      const finalEnd = start <= end ? end : start
      onPresetChange("custom")
      onDateChange(finalStart, finalEnd)
    }
  }

  const isSelected = (dateStr: string) => {
    return dateStr === localStart || dateStr === localEnd
  }

  const isInRange = (dateStr: string) => {
    if (localStart && localEnd) {
      return dateStr > localStart && dateStr < localEnd
    }
    if (localStart && !localEnd && hoverDate) {
      return dateStr > localStart && dateStr <= hoverDate
    }
    return false
  }

  return (
    <div className="relative z-50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-3 shadow-md backdrop-blur-md">
      {/* 10-Min Auto Refresh Live Status Indicator */}
      <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
          Авто-обновяване на 10 мин
        </span>
      </div>

      {/* Time Shortcuts & Calendar Picker Grouped Together */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
        <Button
          variant={preset === "today" ? "default" : "outline"}
          size="sm"
          onClick={() => onPresetChange("today")}
          className="h-7 sm:h-8 text-[11px] sm:text-xs font-medium px-2 sm:px-3 flex-1 sm:flex-none justify-center"
        >
          Днес
        </Button>

        <Button
          variant={preset === "yesterday" ? "default" : "outline"}
          size="sm"
          onClick={() => onPresetChange("yesterday")}
          className="h-7 sm:h-8 text-[11px] sm:text-xs font-medium px-2 sm:px-3 flex-1 sm:flex-none justify-center"
        >
          Вчера
        </Button>

        <Button
          variant={preset === "this_week" ? "default" : "outline"}
          size="sm"
          onClick={() => onPresetChange("this_week")}
          className="h-7 sm:h-8 text-[11px] sm:text-xs font-medium px-2 sm:px-3 flex-1 sm:flex-none justify-center"
        >
          Тази седмица
        </Button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        {/* Single Expandable Date Range Picker Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 sm:h-9 px-2.5 sm:px-3 text-[11px] sm:text-xs font-semibold border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all flex items-center justify-between sm:justify-start gap-2 shadow-sm w-full sm:w-auto"
            >
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500 shrink-0" />
                <span className="truncate">{formattedRangeDisplay}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 opacity-70 ml-1 shrink-0" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-[calc(100vw-32px)] sm:w-[440px] max-w-[440px] p-3">
            <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-3">
              {/* Left Column: Preset Options */}
              <div className="space-y-1 pr-2 sm:border-r border-slate-200 dark:border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Избери период
                </div>
                {presets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onPresetChange(p.id)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                      preset === p.id
                        ? "bg-indigo-600 text-white font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{p.label}</span>
                    {preset === p.id && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                ))}
              </div>

              {/* Right Column: Interactive Visual Single Calendar */}
              <div className="space-y-2 pt-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Персонализиран календар
                  </div>

                  {/* Month Navigation */}
                  <div className="flex items-center justify-between px-1 mb-2">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Предишен месец"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {MONTH_NAMES_BG[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Следващ месец"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Weekdays Header */}
                  <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-slate-400 mb-1">
                    {WEEKDAYS_BG.map((w, idx) => (
                      <div key={idx} className="py-1">
                        {w}
                      </div>
                    ))}
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
                    {calendarDays.map((d, idx) => {
                      const selected = isSelected(d.dateStr)
                      const inRange = isInRange(d.dateStr)
                      const isFuture = d.dateStr > MAX_DATE

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isFuture}
                          onClick={() => !isFuture && handleDayClick(d.dateStr)}
                          onMouseEnter={() => !isFuture && setHoverDate(d.dateStr)}
                          onMouseLeave={() => setHoverDate(null)}
                          className={`h-7 w-full flex items-center justify-center text-xs transition-all relative ${
                            isFuture
                              ? "text-slate-300 dark:text-slate-700 opacity-30 cursor-not-allowed pointer-events-none"
                              : !d.isCurrentMonth
                              ? "text-slate-400 dark:text-slate-500 opacity-60"
                              : "text-slate-700 dark:text-slate-200"
                          } ${
                            !isFuture && selected
                              ? "bg-indigo-600 text-white font-bold rounded-md shadow-sm z-10"
                              : !isFuture && inRange
                              ? "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold"
                              : !isFuture
                              ? "hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                              : ""
                          }`}
                        >
                          {d.dayNum}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Selected Date Summary & Apply Button */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium">
                    {localStart && localEnd
                      ? `${localStart.split("-").reverse().join(".")} – ${localEnd.split("-").reverse().join(".")}`
                      : localStart
                      ? `Начало: ${localStart.split("-").reverse().join(".")}`
                      : "Изберете начална и крайна дата"}
                  </div>

                  <Button
                    onClick={handleApply}
                    variant="default"
                    size="sm"
                    disabled={!localStart && !localEnd}
                    className="w-full h-8 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                  >
                    <Check className="mr-1 h-3.5 w-3.5" />
                    Приложи датите
                  </Button>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRefresh && onRefresh()}
          disabled={isRefreshing}
          className="h-8 px-2 text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
          title="Обнови данните за избрания период"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>
  )
}
