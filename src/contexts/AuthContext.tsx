import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ApiError, setApiAuthTokenResolver, setApiUnauthorizedHandler } from '../lib/apiClient'
import { authService, normalizeUser, type AuthUser, type LoginPayload } from '../services/authService'

const SESSION_TOKEN_KEY = 'crabb_auth_token'
const SESSION_USER_KEY = 'crabb_auth_user'

type AuthContextValue = {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  isInitializing: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<AuthUser>
  establishSession: (token: string, user?: AuthUser) => Promise<AuthUser>
  logout: () => Promise<void>
  refreshCurrentUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readPersistedToken(): string | null {
  return localStorage.getItem(SESSION_TOKEN_KEY)
}

function persistToken(token: string | null) {
  if (token) {
    localStorage.setItem(SESSION_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(SESSION_TOKEN_KEY)
  }
}

function readPersistedUser(): AuthUser | null {
  const raw = localStorage.getItem(SESSION_USER_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as unknown
    return normalizeUser(parsed)
  } catch {
    localStorage.removeItem(SESSION_USER_KEY)
    return null
  }
}

function persistUser(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(SESSION_USER_KEY)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readPersistedToken())
  const [user, setUser] = useState<AuthUser | null>(() => readPersistedUser())
  const [isInitializing, setIsInitializing] = useState(true)

  const clearSession = useCallback(() => {
    setToken(null)
    setUser(null)
    persistToken(null)
    persistUser(null)
  }, [])

  const refreshCurrentUser = useCallback(async (tokenOverride?: string) => {
    const currentUser = await authService.getCurrentUser(tokenOverride)
    setUser(currentUser)
    persistUser(currentUser)
  }, [])

  const login = useCallback(async (payload: LoginPayload): Promise<AuthUser> => {
    const result = await authService.login(payload)
    setToken(result.token)
    persistToken(result.token)

    if (result.user) {
      setUser(result.user)
      persistUser(result.user)
    }

    try {
      await refreshCurrentUser(result.token)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setUser(null)
        persistUser(null)
        throw error
      }
      throw error
    }

    return authService.getCurrentUser(result.token)
  }, [refreshCurrentUser])

  const establishSession = useCallback(async (authToken: string, initialUser?: AuthUser): Promise<AuthUser> => {
    setToken(authToken)
    persistToken(authToken)

    if (initialUser) {
      setUser(initialUser)
      persistUser(initialUser)
    }

    await refreshCurrentUser(authToken)
    return authService.getCurrentUser(authToken)
  }, [refreshCurrentUser])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      clearSession()
    }
  }, [clearSession])

  useEffect(() => {
    setApiAuthTokenResolver(() => token)
  }, [token])

  useEffect(() => {
    setApiUnauthorizedHandler(clearSession)
    return () => setApiUnauthorizedHandler(null)
  }, [clearSession])

  useEffect(() => {
    let active = true

    if (!token) {
      if (user) {
        setUser(null)
        persistUser(null)
      }
      setIsInitializing(false)
      return () => {
        active = false
      }
    }

    if (import.meta.env.DEV) {
      console.log('[AUTH][ME][REQ] Hidratando sesión desde token persistido.')
    }

    refreshCurrentUser()
      .catch(() => {
        if (import.meta.env.DEV) {
          console.log('[AUTH][ME][RES] Error al hidratar sesión, limpiando token.')
        }
        if (active) clearSession()
      })
      .finally(() => {
        if (active) setIsInitializing(false)
      })

    return () => {
      active = false
    }
  }, [token, clearSession, refreshCurrentUser])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isInitializing,
      isLoading: isInitializing,
      login,
      establishSession,
      logout,
      refreshCurrentUser,
    }),
    [token, user, isInitializing, login, establishSession, logout, refreshCurrentUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
