"use client"

import * as React from "react"
import { Calendar as CalendarIcon, RotateCcw, Check, ChevronDown, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"

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
  onReset: () => void
}

const MIN_DATE = "2026-01-27"
const MAX_DATE = new Date().toISOString().slice(0, 10)

export function DateRangePicker({
  startDate,
  endDate,
  preset,
  onPresetChange,
  onDateChange,
  onReset,
}: DateRangePickerProps) {
  const [localStart, setLocalStart] = React.useState(startDate)
  const [localEnd, setLocalEnd] = React.useState(endDate)

  React.useEffect(() => {
    setLocalStart(startDate)
    setLocalEnd(endDate)
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

  // Formatted date string for button display: e.g. "27.01.2026 – 03.08.2026"
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

  const handleApply = () => {
    onPresetChange("custom")
    onDateChange(localStart, localEnd)
  }

  return (
    <div className="relative z-30 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-3 shadow-md backdrop-blur-md">
      {/* Time Shortcuts & Calendar Picker Grouped Together */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center space-x-1.5 pr-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span className="hidden sm:inline">Бързи:</span>
        </div>

        <Button
          variant={preset === "today" ? "default" : "outline"}
          size="sm"
          onClick={() => onPresetChange("today")}
          className="h-8 text-xs font-medium px-3"
        >
          Днес
        </Button>

        <Button
          variant={preset === "yesterday" ? "default" : "outline"}
          size="sm"
          onClick={() => onPresetChange("yesterday")}
          className="h-8 text-xs font-medium px-3"
        >
          Вчера
        </Button>

        <Button
          variant={preset === "this_week" ? "default" : "outline"}
          size="sm"
          onClick={() => onPresetChange("this_week")}
          className="h-8 text-xs font-medium px-3"
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
              className="h-9 px-3 text-xs font-semibold border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all flex items-center gap-2 shadow-sm"
            >
              <CalendarIcon className="h-4 w-4 text-indigo-500" />
              <span>{formattedRangeDisplay}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70 ml-1" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-[420px] p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              {/* Right Column: Custom Start - End Date Inputs */}
              <div className="space-y-3 pt-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Персонализиран период
                </div>

                <div className="space-y-2">
                  <div className="space-y-1 text-xs">
                    <label className="text-[11px] text-slate-500 font-medium">От (Начална дата):</label>
                    <Input
                      type="date"
                      min={MIN_DATE}
                      max={MAX_DATE}
                      value={localStart}
                      onChange={(e) => setLocalStart(e.target.value)}
                      className="h-8 text-xs px-2 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-[11px] text-slate-500 font-medium">До (Крайна дата):</label>
                    <Input
                      type="date"
                      min={MIN_DATE}
                      max={MAX_DATE}
                      value={localEnd}
                      onChange={(e) => setLocalEnd(e.target.value)}
                      className="h-8 text-xs px-2 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleApply}
                  variant="default"
                  size="sm"
                  className="w-full h-8 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white mt-2"
                >
                  <Check className="mr-1 h-3.5 w-3.5" />
                  Приложи датите
                </Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {(preset !== "all" || startDate || endDate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 px-2 text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
            title="Изчисти филтрите"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
