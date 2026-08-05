"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingCart, ShieldCheck, Sun, Moon, LogOut, User as UserIcon, LayoutDashboard, GitCompare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"

interface DashboardHeaderProps {
  isMockData: boolean
  theme: "dark" | "light"
  onToggleTheme: () => void
}

export function DashboardHeader({
  isMockData,
  theme,
  onToggleTheme,
}: DashboardHeaderProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const isCompare = pathname === "/compare"

  return (
    <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-lg shadow-indigo-500/25">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  WooCommerce Analytics
                </h1>
                {isMockData ? (
                  <Badge variant="warning" className="text-[10px] tracking-wide font-semibold">
                    MOCK DATA
                  </Badge>
                ) : (
                  <Badge variant="success" className="text-[10px] tracking-wide font-semibold flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    LIVE API
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Real-time WooCommerce order management & sales analytics
              </p>
            </div>
          </div>

          {/* Top Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                !isCompare
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Табло (Overview)</span>
            </Link>
            <Link
              href="/compare"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                isCompare
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <GitCompare className="h-3.5 w-3.5" />
              <span>Сравнение на периоди</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile Navigation Tabs */}
          <div className="flex md:hidden items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <Link
              href="/"
              className={`p-1.5 rounded-lg text-xs font-medium ${
                !isCompare ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400" : "text-slate-500"
              }`}
              title="Табло (Overview)"
            >
              <LayoutDashboard className="h-4 w-4" />
            </Link>
            <Link
              href="/compare"
              className={`p-1.5 rounded-lg text-xs font-medium ${
                isCompare ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400" : "text-slate-500"
              }`}
              title="Сравнение на периоди"
            >
              <GitCompare className="h-4 w-4" />
            </Link>
          </div>

          {/* Light / Dark Mode Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleTheme}
            className="h-9 text-xs border-slate-300 dark:border-slate-700/80 bg-slate-100/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
            <span className="ml-1.5 hidden lg:inline capitalize">
              {theme === "dark" ? "Light" : "Dark"}
            </span>
          </Button>

          {user && (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <span className="hidden lg:flex items-center text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/50 max-w-[160px] truncate">
                <UserIcon className="h-3.5 w-3.5 mr-1.5 text-indigo-500 shrink-0" />
                <span className="truncate">{user.email}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="h-9 text-xs border-red-300 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
                title="Изход"
              >
                <LogOut className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Изход</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

