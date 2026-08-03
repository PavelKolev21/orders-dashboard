"use client"

import * as React from "react"
import type { User as NetlifyUser } from "netlify-identity-widget"

export type { NetlifyUser }

interface AuthContextType {
  user: NetlifyUser | null
  loading: boolean
  isTokenFlow: boolean
  openLoginModal: (tab?: "login" | "signup") => void
  logout: () => void
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  loading: true,
  isTokenFlow: false,
  openLoginModal: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<NetlifyUser | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [isTokenFlow, setIsTokenFlow] = React.useState<boolean>(false)
  const netlifyIdentityRef = React.useRef<any>(null)

  React.useEffect(() => {
    if (typeof window === "undefined") return

    // Check if URL contains invitation/confirmation/recovery tokens
    const hash = window.location.hash || ""
    const hasAuthToken =
      hash.includes("invite_token") ||
      hash.includes("recovery_token") ||
      hash.includes("confirmation_token") ||
      hash.includes("access_token")

    if (hasAuthToken) {
      setIsTokenFlow(true)
    }

    // Dynamically import netlify-identity-widget only in browser environment
    import("netlify-identity-widget").then((widgetModule) => {
      const netlifyIdentity = widgetModule.default || widgetModule
      netlifyIdentityRef.current = netlifyIdentity

      const siteUrl = process.env.NEXT_PUBLIC_NETLIFY_SITE_URL
      netlifyIdentity.init({
        APIUrl: siteUrl ? `${siteUrl.replace(/\/$/, "")}/.netlify/functions/identity` : undefined,
      })

      // Get current user if already authenticated
      const currentUser = netlifyIdentity.currentUser()
      if (currentUser) {
        setUser(currentUser)
        setLoading(false)
        setIsTokenFlow(false)
      }

      const handleInit = (initUser?: NetlifyUser | null) => {
        if (initUser) {
          setUser(initUser)
          setLoading(false)
          setIsTokenFlow(false)
        } else {
          const curr = netlifyIdentity.currentUser()
          if (curr) {
            setUser(curr)
            setLoading(false)
            setIsTokenFlow(false)
          } else {
            setUser(null)
            // If handling an invite/recovery token, keep loading until user submits password modal
            if (!hasAuthToken) {
              setLoading(false)
            }
          }
        }
      }

      const handleLogin = (loggedInUser?: NetlifyUser) => {
        const validUser = loggedInUser || netlifyIdentity.currentUser()
        if (validUser) {
          setUser(validUser)
        }
        setLoading(false)
        setIsTokenFlow(false)
        netlifyIdentity.close()

        // Clean up hash token from URL
        if (typeof window !== "undefined" && window.location.hash) {
          window.history.replaceState(null, "", window.location.pathname)
        }
      }

      const handleLogout = () => {
        setUser(null)
        setLoading(false)
        setIsTokenFlow(false)
      }

      netlifyIdentity.on("init", handleInit as any)
      netlifyIdentity.on("login", handleLogin as any)
      netlifyIdentity.on("logout", handleLogout)
      netlifyIdentity.on("close", () => {
        // If user closes modal during token flow without logging in, finish loading so redirect can happen
        setLoading(false)
        setIsTokenFlow(false)
      })
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
    <AuthContext.Provider value={{ user, loading, isTokenFlow, openLoginModal, logout }}>
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
