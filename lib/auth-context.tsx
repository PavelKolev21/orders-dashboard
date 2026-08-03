"use client"

import * as React from "react"
import type { User as NetlifyUser } from "netlify-identity-widget"

export type { NetlifyUser }

interface AuthContextType {
  user: NetlifyUser | null
  loading: boolean
  openLoginModal: (tab?: "login" | "signup") => void
  logout: () => void
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  loading: true,
  openLoginModal: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<NetlifyUser | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)
  const netlifyIdentityRef = React.useRef<any>(null)

  React.useEffect(() => {
    if (typeof window === "undefined") return

    let isMounted = true

    // Safety fallback timer: ensure loading never gets stuck on true for more than 1.2s
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setLoading(false)
      }
    }, 1200)

    import("netlify-identity-widget").then((widgetModule) => {
      if (!isMounted) return
      const netlifyIdentity = widgetModule.default || widgetModule
      netlifyIdentityRef.current = netlifyIdentity

      const updateUserState = (u?: NetlifyUser | null) => {
        const currentUser = u || netlifyIdentity.currentUser()
        if (isMounted) {
          setUser(currentUser || null)
          setLoading(false)
        }
      }

      // Attach event listeners BEFORE calling init()
      netlifyIdentity.on("init", (initUser?: NetlifyUser | null) => {
        updateUserState(initUser)
      })

      netlifyIdentity.on("login", (loggedInUser?: NetlifyUser) => {
        updateUserState(loggedInUser)
        netlifyIdentity.close()
        if (typeof window !== "undefined" && window.location.hash) {
          window.history.replaceState(null, "", window.location.pathname)
        }
      })

      netlifyIdentity.on("logout", () => {
        if (isMounted) {
          setUser(null)
          setLoading(false)
        }
      })

      netlifyIdentity.on("close", () => {
        if (isMounted) {
          setLoading(false)
        }
      })

      netlifyIdentity.on("error", () => {
        if (isMounted) {
          setLoading(false)
        }
      })

      // Initialize Netlify Identity widget
      const siteUrl = process.env.NEXT_PUBLIC_NETLIFY_SITE_URL
      netlifyIdentity.init({
        APIUrl: siteUrl ? `${siteUrl.replace(/\/$/, "")}/.netlify/functions/identity` : undefined,
      })

      // Check current user immediately
      updateUserState()
    })

    return () => {
      isMounted = false
      clearTimeout(safetyTimer)
    }
  }, [])

  const openLoginModal = React.useCallback((tab: "login" | "signup" = "login") => {
    if (netlifyIdentityRef.current) {
      netlifyIdentityRef.current.open(tab)
    } else if (typeof window !== "undefined") {
      import("netlify-identity-widget").then((widgetModule) => {
        const netlifyIdentity = widgetModule.default || widgetModule
        netlifyIdentityRef.current = netlifyIdentity
        netlifyIdentity.open(tab)
      })
    }
  }, [])

  const logout = React.useCallback(() => {
    if (netlifyIdentityRef.current) {
      netlifyIdentityRef.current.logout()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, openLoginModal, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
