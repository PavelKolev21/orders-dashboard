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

    // Dynamically import netlify-identity-widget only in browser environment
    import("netlify-identity-widget").then((widgetModule) => {
      const netlifyIdentity = widgetModule.default || widgetModule
      netlifyIdentityRef.current = netlifyIdentity

      const siteUrl = process.env.NEXT_PUBLIC_NETLIFY_SITE_URL
      netlifyIdentity.init({
        APIUrl: siteUrl ? `${siteUrl.replace(/\/$/, "")}/.netlify/functions/identity` : undefined,
      })


      const currentUser = netlifyIdentity.currentUser()
      if (currentUser) {
        setUser(currentUser)
      }
      setLoading(false)

      const handleInit = (initUser?: NetlifyUser | null) => {
        setUser(initUser || null)
        setLoading(false)
      }

      const handleLogin = (loggedInUser?: NetlifyUser) => {
        if (loggedInUser) {
          setUser(loggedInUser)
        }
        setLoading(false)
        netlifyIdentity.close()
      }

      const handleLogout = () => {
        setUser(null)
        setLoading(false)
      }

      netlifyIdentity.on("init", handleInit as any)
      netlifyIdentity.on("login", handleLogin as any)
      netlifyIdentity.on("logout", handleLogout)
    })
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
