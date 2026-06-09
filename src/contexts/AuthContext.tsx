// src/contexts/AuthContext.tsx
// Real JWT-based authentication context.
// Token is stored under "ista-token" in localStorage.
// On mount it validates any existing token by calling /auth/me.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { ReactNode } from "react"
import { authApi } from "@/api/endpoints/auth"
import { ApiError } from "@/api/client"
import type { Role, User, RoleName } from "@/types"

const TOKEN_KEY = "ista-token"
const USER_KEY = "ista-user"

interface AuthContextValue {
  user: User | null
  role: Role | null
  roleName: RoleName | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  forgotPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY)
    if (!stored || stored === "undefined") return null
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error("[Auth] Failed to parse stored user:", e)
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(true)

  // On mount: validate the session. 
  // If your Go backend doesn't have /auth/me, we rely on the stored user object.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setUser(null)
      localStorage.removeItem(USER_KEY)
      setIsLoading(false)
      return
    }

    // Attempt to refresh user data if endpoint exists, otherwise just keep current state
    authApi.me()
      .then((userData) => {
        if (userData) {
          setUser(userData)
          localStorage.setItem(USER_KEY, JSON.stringify(userData))
        }
      })
      .catch((err) => {
        console.warn("[Auth] Session validation failed:", err)
        // If 404, the endpoint might not exist, we keep the local user
        if (err.status === 404) {
          console.info("[Auth] /auth/me not found, using local session.")
        } else {
          // For other errors (401, etc.), clear session
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          setUser(null)
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password })
    if (res.token) {
      localStorage.setItem(TOKEN_KEY, res.token)
    }
    // Ensure we store the user object too
    localStorage.setItem(USER_KEY, JSON.stringify(res))
    setUser(res)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
    authApi.logout().catch(() => {})
  }, [])

  const forgotPassword = useCallback(async (email: string) => {
    await authApi.forgotPassword(email)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user ? (typeof user.role === "object" ? user.role : null) : null,
      roleName: user ? (typeof user.role === "string" ? user.role : user.role?.nom) : null,
      isAuthenticated: user !== null,
      isLoading,
      login,
      logout,
      forgotPassword,
    }),
    [user, isLoading, login, logout, forgotPassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider")
  return ctx
}
