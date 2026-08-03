"use client"

import * as React from "react"

declare global {
  interface Window {
    netlifyIdentity?: any
  }
}

export interface NetlifyUser {
  id: string
  email: string
  created_at?: string
  app_metadata?: {
    provider?: string
    roles?: string[]
  }
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

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

  React.useEffect(() => {
    if (typeof window === "undefined") return

    let isMounted = true

    const initWidget = () => {
      const netlifyIdentity = window.netlifyIdentity
      if (!netlifyIdentity) return false

      try {
        netlifyIdentity.init()

        const currentUser = netlifyIdentity.currentUser()
        if (currentUser && isMounted) {
          setUser(currentUser)
        }
        if (isMounted) {
          setLoading(false)
        }

        netlifyIdentity.on("init", (initUser: any) => {
          if (isMounted) {
            setUser(initUser || netlifyIdentity.currentUser() || null)
            setLoading(false)
          }
        })

        netlifyIdentity.on("login", (loggedInUser: any) => {
          if (isMounted) {
            setUser(loggedInUser || netlifyIdentity.currentUser() || null)
            setLoading(false)
          }
          netlifyIdentity.close()
          if (window.location.hash) {
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

        return true
      } catch (err) {
        console.error("Error initializing Netlify Identity:", err)
        if (isMounted) setLoading(false)
        return false
      }
    }

    if (window.netlifyIdentity) {
      initWidget()
    } else {
      const interval = setInterval(() => {
        if (window.netlifyIdentity) {
          clearInterval(interval)
          initWidget()
        }
      }, 50)

      const fallbackTimer = setTimeout(() => {
        clearInterval(interval)
        if (isMounted) setLoading(false)
      }, 600)

      return () => {
        clearInterval(interval)
        clearTimeout(fallbackTimer)
        isMounted = false
      }
    }

    return () => {
      isMounted = false
    }
  }, [])

  const openLoginModal = React.useCallback((tab: "login" | "signup" = "login") => {
    if (typeof window !== "undefined" && window.netlifyIdentity) {
      window.netlifyIdentity.open(tab)
    } else {
      alert("Netlify Identity зарежда... Моля опитайте отново след секунда.")
    }
  }, [])

  const logout = React.useCallback(() => {
    if (typeof window !== "undefined" && window.netlifyIdentity) {
      window.netlifyIdentity.logout()
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
