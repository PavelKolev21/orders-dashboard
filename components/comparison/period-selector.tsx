"use client"

import * as React from "react"
import { PeriodConfig, DEFAULT_PERIOD_COLORS, getPresetPeriods } from "@/lib/comparison"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Plus, Trash2, RotateCcw, Sparkles } from "lucide-react"

interface PeriodSelectorProps {
  periods: PeriodConfig[]
  onChange: (periods: PeriodConfig[]) => void
  onReset: () => void
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

  const handleAddPeriod = () => {
    const nextIdx = periods.length + 1
    const color = DEFAULT_PERIOD_COLORS[(nextIdx - 1) % DEFAULT_PERIOD_COLORS.length]
    
    // Default start/end to last month or previous offset
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth() - (nextIdx - 1)
    const sDate = new Date(y, m, 1)
    const eDate = new Date(y, m + 1, 0)

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

              {/* Date Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-slate-400 block mb-0.5">От дата</label>
                  <Input
                    type="date"
                    value={p.startDate}
                    onChange={(e) => handleUpdatePeriod(p.id, "startDate", e.target.value)}
                    className="h-8 text-[11px] sm:text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 px-1.5 sm:px-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-400 block mb-0.5">До дата</label>
                  <Input
                    type="date"
                    value={p.endDate}
                    onChange={(e) => handleUpdatePeriod(p.id, "endDate", e.target.value)}
                    className="h-8 text-[11px] sm:text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 px-1.5 sm:px-2"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
