"use client"

import * as React from "react"
import { PeriodConfig, DEFAULT_PERIOD_COLORS, getPresetPeriods } from "@/lib/comparison"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Plus, Trash2, RotateCcw, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PeriodSelectorProps {
  periods: PeriodConfig[]
  onChange: (periods: PeriodConfig[]) => void
  onReset: () => void
}

const MONTH_NAMES_BG = [
  "Януари", "Февруари", "Март", "Април", "Май", "Юни",
  "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
]
const WEEKDAYS_BG = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"]

/**
 * Unified Date Range Picker Popover for a single Period Card
 * Allows clicking on either "От дата" or "До дата" to open a SINGLE calendar
 * and select both start and end dates together in one window.
 */
function PeriodDateRangePicker({
  startDate,
  endDate,
  onDateChange,
}: {
  startDate: string
  endDate: string
  onDateChange: (start: string, end: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [localStart, setLocalStart] = React.useState(startDate)
  const [localEnd, setLocalEnd] = React.useState(endDate)
  const [hoverDate, setHoverDate] = React.useState<string | null>(null)

  const [viewDate, setViewDate] = React.useState<Date>(() => {
    if (endDate) {
      const d = new Date(endDate)
      if (!isNaN(d.getTime())) return d
    }
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

  const calendarDays = React.useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

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

  const handleDayClick = (dateStr: string) => {
    if (!localStart || (localStart && localEnd)) {
      setLocalStart(dateStr)
      setLocalEnd("")
    } else {
      if (dateStr >= localStart) {
        setLocalEnd(dateStr)
        onDateChange(localStart, dateStr)
        setOpen(false)
      } else {
        setLocalStart(dateStr)
        setLocalEnd("")
      }
    }
  }

  const isSelected = (dateStr: string) => dateStr === localStart || dateStr === localEnd
  const isInRange = (dateStr: string) => {
    if (localStart && localEnd) return dateStr > localStart && dateStr < localEnd
    if (localStart && hoverDate && !localEnd) {
      const min = localStart < hoverDate ? localStart : hoverDate
      const max = localStart < hoverDate ? hoverDate : localStart
      return dateStr > min && dateStr < max
    }
    return false
  }

  const formatDisplay = (dateStr: string) => {
    if (!dateStr) return "Изберете"
    const [y, m, d] = dateStr.split("-")
    return `${d}.${m}.${y}`
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div className="grid grid-cols-2 gap-2 cursor-pointer group">
          <div>
            <label className="text-[10px] font-medium text-slate-400 block mb-0.5">От дата</label>
            <div className="h-8 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 flex items-center justify-between text-xs text-slate-800 dark:text-slate-200 group-hover:border-indigo-500 transition-colors">
              <span>{formatDisplay(startDate)}</span>
              <Calendar className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-500" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-400 block mb-0.5">До дата</label>
            <div className="h-8 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 flex items-center justify-between text-xs text-slate-800 dark:text-slate-200 group-hover:border-indigo-500 transition-colors">
              <span>{formatDisplay(endDate)}</span>
              <Calendar className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-500" />
            </div>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="p-3.5 w-72 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl z-50 rounded-xl">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {MONTH_NAMES_BG[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <div className="flex items-center space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400">
            {WEEKDAYS_BG.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((d, i) => {
              const selected = isSelected(d.dateStr)
              const inRange = isInRange(d.dateStr)

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDayClick(d.dateStr)}
                  onMouseEnter={() => setHoverDate(d.dateStr)}
                  onMouseLeave={() => setHoverDate(null)}
                  className={`h-7 text-xs rounded-md font-medium transition-all ${
                    !d.isCurrentMonth
                      ? "text-slate-300 dark:text-slate-700"
                      : selected
                      ? "bg-indigo-600 text-white font-bold shadow-md"
                      : inRange
                      ? "bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {d.dayNum}
                </button>
              )
            })}
          </div>

          <div className="text-[11px] text-center font-medium text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2">
            {localStart && !localEnd ? "Изберете крайна дата..." : "Кликнете за промяна на периода"}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function PeriodSelector({ periods, onChange, onReset }: PeriodSelectorProps) {
  const presets = React.useMemo(() => getPresetPeriods(), [])

  const handleSelectPreset = (presetName: string) => {
    const found = presets.find((p) => p.name === presetName)
    if (found) {
      onChange(found.periods)
    }
  }

  const handleUpdatePeriod = (id: string, field: keyof PeriodConfig, value: string) => {
    const updated = periods.map((p) => {
      if (p.id === id) {
        return { ...p, [field]: value }
      }
      return p
    })
    onChange(updated)
  }

  const handleUpdatePeriodDates = (id: string, startDate: string, endDate: string) => {
    const updated = periods.map((p) => {
      if (p.id === id) {
        return { ...p, startDate, endDate }
      }
      return p
    })
    onChange(updated)
  }

  const handleAddPeriod = () => {
    const nextIdx = periods.length + 1
    const color = DEFAULT_PERIOD_COLORS[(nextIdx - 1) % DEFAULT_PERIOD_COLORS.length]
    
    // Default new period to CURRENT MONTH ("Този месец")
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    const sDate = new Date(y, m, 1)
    const eDate = new Date(y, m, now.getDate())

    const formatLocal = (d: Date) => {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    const newPeriod: PeriodConfig = {
      id: `p${Date.now()}`,
      label: `Период ${nextIdx}`,
      startDate: formatLocal(sDate),
      endDate: formatLocal(eDate),
      color,
    }

    onChange([...periods, newPeriod])
  }

  const handleRemovePeriod = (id: string) => {
    if (periods.length <= 2) return // Maintain at least 2 periods
    onChange(periods.filter((p) => p.id !== id))
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5 sm:p-6 shadow-xl space-y-5 sm:space-y-6">
      {/* Preset Quick Selection Buttons */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-500 shrink-0" />
            <span>Бързи шаблони за съпоставка (Presets)</span>
          </label>
        </div>
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-1.5 sm:gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.name}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectPreset(preset.name)}
              className="h-auto min-h-[32px] py-1.5 px-2.5 text-[11px] sm:text-xs text-left whitespace-normal sm:whitespace-nowrap max-w-full leading-tight bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all justify-start sm:justify-center"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800/60 pt-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
            <span>Настройка на периоди ({periods.length} периода)</span>
          </h3>

          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              className="h-8 text-[11px] sm:text-xs px-2 sm:px-3 bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1 w-full sm:w-auto"
              title="Изчисти персонализираните периоди и върни по подразбиране"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Върни по подразбиране</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleAddPeriod}
              className="h-8 text-[11px] sm:text-xs px-2 sm:px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md flex items-center justify-center gap-1 w-full sm:w-auto"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Добави период</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Period Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {periods.map((p, idx) => (
            <div
              key={p.id}
              className="p-3 sm:p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 relative space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              {/* Header tag & indicator */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: p.color }}
                  />
                  <Input
                    type="text"
                    value={p.label}
                    onChange={(e) => handleUpdatePeriod(p.id, "label", e.target.value)}
                    className="h-7 text-xs font-bold bg-transparent border-slate-200 dark:border-slate-700/60 focus:border-indigo-500 w-full sm:w-36 px-2"
                    placeholder={`Период ${idx + 1}`}
                  />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="color"
                    value={p.color}
                    onChange={(e) => handleUpdatePeriod(p.id, "color", e.target.value)}
                    className="h-6 w-6 rounded cursor-pointer border-0 bg-transparent"
                    title="Промени цвят на линията"
                  />
                  {periods.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePeriod(p.id)}
                      className="h-7 w-7 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
                      title="Премахни този период"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Single Unified Calendar Range Picker Triggering from "От дата" & "До дата" */}
              <PeriodDateRangePicker
                startDate={p.startDate}
                endDate={p.endDate}
                onDateChange={(s, e) => handleUpdatePeriodDates(p.id, s, e)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
