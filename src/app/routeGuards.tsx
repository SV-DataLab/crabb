import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isAdminRole } from '../utils/adminAccess'
import { getDefaultAuthenticatedPath, hasLinkedSocio, isSocioUser } from '../utils/socioAccess'

function FullScreenMessage({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen min-h-dvh items-center justify-center bg-slate-50 px-4">
      <p className="text-sm text-slate-600">{message}</p>
    </div>
  )
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return <FullScreenMessage message="Verificando sesión..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing, user } = useAuth()

  if (isInitializing) {
    return <FullScreenMessage message="Cargando..." />
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultAuthenticatedPath(user)} replace />
  }

  return <>{children}</>
}

export function AdminOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing, user } = useAuth()

  if (isInitializing) {
    return <FullScreenMessage message="Verificando permisos..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdminRole(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export function SocioOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing, user } = useAuth()

  if (isInitializing) {
    return <FullScreenMessage message="Verificando permisos..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (isAdminRole(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  if (!isSocioUser(user)) {
    return <Navigate to="/cuenta-sin-socio" replace />
  }

  if (!hasLinkedSocio(user)) {
    return <Navigate to="/cuenta-sin-socio" replace />
  }

  return <>{children}</>
}
