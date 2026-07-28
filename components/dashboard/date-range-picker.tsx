"use client"

import * as React from "react"
import { Calendar, RotateCcw, Filter, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type DateRangePreset = "all" | "l7d" | "l14d" | "l30d" | "custom"

interface DateRangePickerProps {
  startDate: string
  endDate: string
  preset: DateRangePreset
  onPresetChange: (preset: DateRangePreset) => void
  onDateChange: (startDate: string, endDate: string) => void
  onReset: () => void
}

// First order date in buldent.bg database: 2026-01-27
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

  // Sync props when external reset or preset happens
  React.useEffect(() => {
    setLocalStart(startDate)
    setLocalEnd(endDate)
  }, [startDate, endDate])

  const presets: { id: DateRangePreset; label: string }[] = [
    { id: "all", label: "Всички (All Time)" },
    { id: "l7d", label: "Последни 7 дни" },
    { id: "l14d", label: "Последни 14 дни" },
    { id: "l30d", label: "Последни 30 дни" },
  ]

  const handleApply = () => {
    onPresetChange("custom")
    onDateChange(localStart, localEnd)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleApply()
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-3 shadow-md backdrop-blur-md">
      {/* Preset Quick Buttons */}
      <div className="flex items-center space-x-1.5 overflow-x-auto">
        <div className="flex items-center space-x-1 pr-2 border-r border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Calendar className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
          <span className="hidden md:inline">Период:</span>
        </div>

        {presets.map((p) => (
          <Button
            key={p.id}
            variant={preset === p.id ? "default" : "outline"}
            size="sm"
            onClick={() => onPresetChange(p.id)}
            className="h-8 text-xs font-medium px-3 whitespace-nowrap"
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Custom Calendar Date Range Inputs with Apply Button */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center space-x-1 text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">От:</span>
          <Input
            type="date"
            min={MIN_DATE}
            max={MAX_DATE}
            value={localStart}
            onChange={(e) => setLocalStart(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 w-36 text-xs px-2 bg-slate-50 dark:bg-slate-950/60 border-slate-300 dark:border-slate-800"
          />
        </div>

        <div className="flex items-center space-x-1 text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">До:</span>
          <Input
            type="date"
            min={MIN_DATE}
            max={MAX_DATE}
            value={localEnd}
            onChange={(e) => setLocalEnd(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 w-36 text-xs px-2 bg-slate-50 dark:bg-slate-950/60 border-slate-300 dark:border-slate-800"
          />
        </div>

        <Button
          onClick={handleApply}
          variant="default"
          size="sm"
          className="h-8 px-3 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          <Check className="mr-1 h-3.5 w-3.5" />
          Приложи
        </Button>

        {(preset !== "all" || startDate || endDate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 px-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
            title="Изчисти периодите"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
