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
  login: (email: string, pass: string) => Promise<void>
  openLoginModal: (tab?: "login" | "signup") => void
  logout: () => void
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  openLoginModal: () => {},
  logout: () => {},
})

const DEV_USER: NetlifyUser = {
  id: "dev-local-user",
  email: "pkolevsales21@gmail.com",
  user_metadata: { full_name: "Pavel Kolev (Local)" },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<NetlifyUser | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)
  const isInitializedRef = React.useRef<boolean>(false)

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const isLocalhost =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"

    const setupNetlifyIdentity = () => {
      const netlifyIdentity = window.netlifyIdentity
      if (!netlifyIdentity || isInitializedRef.current) return

      try {
        isInitializedRef.current = true
        netlifyIdentity.init()

        const initialUser = netlifyIdentity.currentUser()
        if (initialUser) {
          setUser(initialUser)
        } else if (isLocalhost) {
          setUser(DEV_USER)
        }

        setLoading(false)

        // Handle URL Hash for Invitations / Recoveries / Confirmations automatically
        const hash = window.location.hash
        if (
          hash &&
          (hash.includes("invite_token") ||
            hash.includes("recovery_token") ||
            hash.includes("confirmation_token"))
        ) {
          try {
            netlifyIdentity.open()
          } catch (e) {
            console.error("Error opening Netlify Identity token modal:", e)
          }
        }

        netlifyIdentity.on("init", (initUser: any) => {
          setUser(initUser || netlifyIdentity.currentUser() || (isLocalhost ? DEV_USER : null))
          setLoading(false)
        })

        netlifyIdentity.on("login", (loggedInUser: any) => {
          setUser(loggedInUser || netlifyIdentity.currentUser() || (isLocalhost ? DEV_USER : null))
          setLoading(false)
          try {
            netlifyIdentity.close()
          } catch {}
        })

        netlifyIdentity.on("logout", () => {
          setUser(isLocalhost ? DEV_USER : null)
          setLoading(false)
        })

        netlifyIdentity.on("error", (err: any) => {
          console.error("Netlify Identity Error:", err)
          setLoading(false)
        })
      } catch (err) {
        console.error("Failed to setup Netlify Identity:", err)
        if (isLocalhost) setUser(DEV_USER)
        setLoading(false)
      }
    }

    if (window.netlifyIdentity) {
      setupNetlifyIdentity()
    } else {
      const checkInterval = setInterval(() => {
        if (window.netlifyIdentity) {
          clearInterval(checkInterval)
          setupNetlifyIdentity()
        }
      }, 100)

      const fallbackTimer = setTimeout(() => {
        clearInterval(checkInterval)
        if (!isInitializedRef.current) {
          if (isLocalhost) setUser(DEV_USER)
          setLoading(false)
        }
      }, 3000)

      return () => {
        clearInterval(checkInterval)
        clearTimeout(fallbackTimer)
      }
    }
  }, [])

  const login = React.useCallback(async (email: string, pass: string) => {
    if (typeof window === "undefined" || !window.netlifyIdentity) {
      throw new Error("Netlify Identity не е зареден. Моля опитайте след момент.")
    }

    try {
      const netlifyIdentity = window.netlifyIdentity
      const gotrue = netlifyIdentity.gotrue

      if (gotrue && typeof gotrue.login === "function") {
        const loggedUser = await gotrue.login(email, pass, true)
        setUser(loggedUser)
        return
      }

      if (typeof netlifyIdentity.login === "function") {
        const loggedUser = await netlifyIdentity.login(email, pass, true)
        setUser(loggedUser)
        return
      }

      throw new Error("Използвайте Netlify Identity уиджета за вход")
    } catch (err: any) {
      console.error("Login error:", err)
      const msg = err?.json?.error_description || err?.message || "Грешен имейл или парола"
      throw new Error(msg)
    }
  }, [])

  const openLoginModal = React.useCallback((tab: "login" | "signup" = "login") => {
    if (typeof window !== "undefined" && window.netlifyIdentity) {
      window.netlifyIdentity.open(tab)
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
    <AuthContext.Provider value={{ user, loading, login, openLoginModal, logout }}>
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
