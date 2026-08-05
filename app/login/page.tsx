"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Lock } from "lucide-react"

export default function LoginPage() {
  const { user, loading, openLoginModal } = useAuth()
  const router = useRouter()

  // Redirect if logged in
  React.useEffect(() => {
    if (!loading && user) {
      router.replace("/")
    }
  }, [user, loading, router])

  // Check if page opened with an invite or recovery token hash
  const hasTokenHash = React.useMemo(() => {
    if (typeof window === "undefined") return false
    const h = window.location.hash
    return h.includes("invite_token") || h.includes("recovery_token") || h.includes("confirmation_token")
  }, [])

  // Auto-open modal if token hash is present
  React.useEffect(() => {
    if (hasTokenHash && !loading) {
      openLoginModal("login")
    }
  }, [hasTokenHash, loading, openLoginModal])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-slate-600 font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Checking Netlify Identity session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc] p-4 sm:p-6 font-sans">
      <div className="w-full max-w-[440px] bg-white rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-8 sm:p-10 flex flex-col items-center text-center">
        {/* Top Lock Icon Container */}
        <div className="w-16 h-16 rounded-2xl bg-[#eff6ff] flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-[#2563eb] stroke-[2]" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
          Internal Orders Dashboard
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-slate-400 font-normal leading-relaxed mb-6 max-w-[340px]">
          Sign in with your Netlify Identity account to access the WooCommerce Orders Dashboard.
        </p>

        {/* Token Hash Notice */}
        {hasTokenHash && (
          <div className="w-full mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs text-left">
            Invitation / reset token detected in link.
          </div>
        )}

        {/* Main Action Button matching screenshot */}
        <button
          type="button"
          onClick={() => openLoginModal("login")}
          className="w-full py-3.5 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white font-medium text-sm sm:text-base rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Log In with Netlify Identity
        </button>

        {/* Bottom Divider Line */}
        <div className="w-full border-t border-slate-100 my-6" />

        {/* Footer Note */}
        <p className="text-xs text-slate-400 font-normal">
          Protected internal tool &bull; Authorized personnel only
        </p>
      </div>
    </div>
  )
}


