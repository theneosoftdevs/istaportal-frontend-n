// src/contexts/AuthContext.tsx
// Real JWT-based authentication context.
// Token is stored under "fino_token" in localStorage.
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

const TOKEN_KEY = "fino_token"
const USER_KEY = "fino_user"

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
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setUser(null)
      localStorage.removeItem(USER_KEY)
      setIsLoading(false)
      return
    }

    authApi.me()
      .then((res: any) => {
        // Normalize possible envelope shapes: { user }, { data: user }, or user at root
        const userData = res && (res.user || res.data || res)
        if (userData) {
          // Normalize role: backend may return role as string (e.g. "apparitorat")
          if (userData.role && typeof userData.role === 'string') {
            userData.role = { nom: userData.role }
          }
          setUser(userData as User)
          localStorage.setItem(USER_KEY, JSON.stringify(userData))
        }
      })
      .catch((err) => {
        console.warn("[Auth] Session validation failed:", err)
        if (err.status !== 404) {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          setUser(null)
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password }) as any

    // Extract token from multiple possible shapes: token, access_token, or data.token
    const token = res.token || res.access_token || res.data?.token
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    }

    // Extract user from multiple possible shapes: user, data.user, or root object
  const userDataRaw = res.user || res.data?.user || res
  const userData = userDataRaw || null

  // Normalize role to object with 'nom' property when backend returns a string
  if (userData && userData.role && typeof userData.role === 'string') {
    userData.role = { nom: userData.role }
  }

  localStorage.setItem(USER_KEY, JSON.stringify(userData))
  setUser(userData as User)
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
      role: user?.role || null,
      roleName: user?.role?.nom || null,
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
