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
  loading: false,
  openLoginModal: () => {},
  logout: () => {},
})

const DEV_USER: NetlifyUser = {
  id: "dev-local-user",
  email: "pkolevsales21@gmail.com",
  user_metadata: { full_name: "Pavel Kolev (Local)" },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<NetlifyUser | null>(() => {
    if (typeof window !== "undefined") {
      const isLocal =
        window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      if (isLocal) return DEV_USER
    }
    return null
  })
  const [loading, setLoading] = React.useState<boolean>(false)

  React.useEffect(() => {
    if (typeof window === "undefined") return

    let isMounted = true
    const isLocalhost =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"

    const initWidget = () => {
      const netlifyIdentity = window.netlifyIdentity
      if (!netlifyIdentity) return false

      try {
        netlifyIdentity.init()

        const currentUser = netlifyIdentity.currentUser()
        if (currentUser && isMounted) {
          setUser(currentUser)
        } else if (isLocalhost && isMounted) {
          setUser(DEV_USER)
        }

        if (isMounted) {
          setLoading(false)
        }

        netlifyIdentity.on("init", (initUser: any) => {
          if (isMounted) {
            setUser(initUser || netlifyIdentity.currentUser() || (isLocalhost ? DEV_USER : null))
            setLoading(false)
          }
        })

        netlifyIdentity.on("login", (loggedInUser: any) => {
          if (isMounted) {
            setUser(loggedInUser || netlifyIdentity.currentUser() || (isLocalhost ? DEV_USER : null))
            setLoading(false)
          }
          try {
            netlifyIdentity.close()
          } catch {}
          if (window.location.hash) {
            window.history.replaceState(null, "", window.location.pathname)
          }
        })

        netlifyIdentity.on("logout", () => {
          if (isMounted) {
            setUser(isLocalhost ? DEV_USER : null)
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
        if (isMounted) {
          if (isLocalhost) setUser(DEV_USER)
          setLoading(false)
        }
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
        if (isMounted) {
          if (isLocalhost && !user) setUser(DEV_USER)
          setLoading(false)
        }
      }, 200)

      return () => {
        clearInterval(interval)
        clearTimeout(fallbackTimer)
        isMounted = false
      }
    }

    return () => {
      isMounted = false
    }
  }, [user])

  const openLoginModal = React.useCallback((tab: "login" | "signup" = "login") => {
    if (typeof window !== "undefined" && window.netlifyIdentity) {
      window.netlifyIdentity.open(tab)
    } else {
      alert("Netlify Identity зарежда... Моля опитайте отново след секунда.")
    }
  }, [])

  const logout = React.useCallback(() => {
    if (typeof window !== "undefined" && window.netlifyIdentity) {
      try {
        window.netlifyIdentity.logout()
      } catch {}
    }
    setUser(null)
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
