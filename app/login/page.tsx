"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ShoppingCart, LogIn, ShieldCheck, Key, ArrowRight, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const { user, loading, openLoginModal } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && user) {
      router.replace("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-400">Проверка на сесията...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 relative overflow-hidden">
      {/* Decorative background grid and glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-xl shadow-indigo-500/25 mb-4">
            <ShoppingCart className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            WooCommerce Orders
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Вход в аналитичното табло през Netlify Identity
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
              Защитен достъп
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Потребителите се добавят и управляват централизирано през вашия **Netlify Dashboard**. Влезте с вашия акаунт, за да достъпите таблото.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-indigo-300">
              <Key className="h-4 w-4" />
              Как да влезете?
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>Натиснете бутона по-долу, за да отворите форма за вход.</li>
              <li>Ако сте получили имейл покана от Netlify, използвайте линка в имейла.</li>
            </ul>
          </div>

          <Button
            onClick={() => openLoginModal("login")}
            className="w-full h-12 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all text-sm flex items-center justify-center gap-2"
          >
            <LogIn className="h-5 w-5" />
            Вход с Netlify Identity
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>

          <div className="pt-2 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={() => openLoginModal("signup")}
              className="text-xs text-slate-400 hover:text-indigo-400 transition-colors"
            >
              Имате покана от администратор? Натиснете тук за потвърждение
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          WooCommerce Analytics Dashboard &bull; Powered by Netlify Identity
        </p>
      </div>
    </div>
  )
}
