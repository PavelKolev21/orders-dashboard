"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
  onClick?: () => void
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  align?: "start" | "end" | "center"
  className?: string
}

interface DropdownMenuCheckboxItemProps {
  children: React.ReactNode
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
}

const DropdownContext = React.createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}>({
  open: false,
  setOpen: () => {},
})

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={menuRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export function DropdownMenuTrigger({ children, onClick }: DropdownMenuTriggerProps) {
  const { open, setOpen } = React.useContext(DropdownContext)
  return (
    <div
      onClick={() => {
        setOpen(!open)
        if (onClick) onClick()
      }}
    >
      {children}
    </div>
  )
}

export function DropdownMenuContent({
  children,
  align = "end",
  className,
}: DropdownMenuContentProps) {
  const { open } = React.useContext(DropdownContext)
  if (!open) return null

  const alignStyles =
    align === "end"
      ? "right-0"
      : align === "start"
      ? "left-0"
      : "left-1/2 -translate-x-1/2"

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 min-w-[12rem] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/95 p-1.5 text-slate-800 dark:text-slate-200 shadow-2xl backdrop-blur-md animate-in fade-in-80 zoom-in-95",
        alignStyles,
        className
      )}
    >
      {children}
    </div>
  )
}

export function DropdownMenuLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400", className)}>
      {children}
    </div>
  )
}

export function DropdownMenuSeparator() {
  return <div className="-mx-1 my-1 h-px bg-slate-200 dark:bg-slate-800" />
}

export function DropdownMenuCheckboxItem({
  children,
  checked,
  onCheckedChange,
  className,
}: DropdownMenuCheckboxItemProps) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onCheckedChange(!checked)
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-xs font-medium outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
        className
      )}
    >
      <span className="mr-2 flex h-4 w-4 items-center justify-center rounded border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-950 text-indigo-600 dark:text-indigo-400">
        {checked && (
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </span>
      <span>{children}</span>
    </div>
  )
}

export function DropdownMenuItem({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  const { setOpen } = React.useContext(DropdownContext)
  return (
    <div
      onClick={() => {
        if (onClick) onClick()
        setOpen(false)
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-xs font-medium outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
        className
      )}
    >
      {children}
    </div>
  )
}
