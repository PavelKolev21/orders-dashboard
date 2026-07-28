"use client"

import * as React from "react"
import { ShoppingCart, RefreshCw, Key, ShieldCheck, Info, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface DashboardHeaderProps {
  isMockData: boolean
  onRefresh: () => void
  isRefreshing: boolean
  theme: "dark" | "light"
  onToggleTheme: () => void
}

export function DashboardHeader({
  isMockData,
  onRefresh,
  isRefreshing,
  theme,
  onToggleTheme,
}: DashboardHeaderProps) {
  const [showConfigModal, setShowConfigModal] = React.useState(false)

  return (
    <>
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40 transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-lg shadow-indigo-500/25">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  WooCommerce Orders Analytics
                </h1>
                {isMockData ? (
                  <Badge variant="warning" className="text-[10px] tracking-wide font-semibold">
                    MOCK DATA MODE
                  </Badge>
                ) : (
                  <Badge variant="success" className="text-[10px] tracking-wide font-semibold flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    LIVE API CONNECTED
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time WooCommerce order management & sales analytics
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
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
              <span className="ml-1.5 hidden sm:inline capitalize">
                {theme === "dark" ? "Light" : "Dark"}
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfigModal(true)}
              className="h-9 text-xs border-slate-300 dark:border-slate-700/80 bg-slate-100/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <Key className="mr-1.5 h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
              API Config
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-9 text-xs border-slate-300 dark:border-slate-700/80 bg-slate-100/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <RefreshCw
                className={`mr-1.5 h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
              Refresh Data
            </Button>
          </div>
        </div>
      </header>

      {/* Config Guide Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  WooCommerce Connection Info
                </h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This dashboard proxies requests to your WooCommerce REST API server securely without exposing consumer secrets to the client browser.
            </p>

            <div className="space-y-2 rounded-xl bg-slate-50 dark:bg-slate-950/70 p-3 text-xs font-mono border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-sans font-semibold">
                Set variables in <code className="text-indigo-600 dark:text-indigo-300">.env.local</code>:
              </div>
              <div className="text-emerald-600 dark:text-emerald-400">WC_STORE_URL=https://your-store.com</div>
              <div className="text-emerald-600 dark:text-emerald-400">WC_CONSUMER_KEY=ck_XXXXXXXXXXXXXXXXX</div>
              <div className="text-emerald-600 dark:text-emerald-400">WC_CONSUMER_SECRET=cs_XXXXXXXXXXXXXXX</div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20">
              <span className="font-semibold text-indigo-600 dark:text-indigo-300">Note:</span> If credentials are left as placeholders, the dashboard seamlessly renders full-featured interactive mock order data for testing.
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowConfigModal(false)}
                className="text-xs"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
