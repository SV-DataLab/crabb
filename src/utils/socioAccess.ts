import type { AuthUser } from '../types/auth'
import { isAdminRole } from './adminAccess'

export function isSocioRole(role?: string | null): boolean {
  const normalized = (role ?? '').trim().toLowerCase()
  return normalized === 'socio'
}

export function hasLinkedSocio(user?: AuthUser | null): boolean {
  if (!user) return false
  if (user.socio?.id != null && String(user.socio.id).trim() !== '') return true
  if (user.socioId != null && String(user.socioId).trim() !== '') return true
  return false
}

export function isSocioUser(user?: AuthUser | null): boolean {
  if (!user) return false
  if (isAdminRole(user.role)) return false
  return isSocioRole(user.role) || hasLinkedSocio(user)
}

export function getDefaultAuthenticatedPath(user?: AuthUser | null): string {
  if (!user) return '/login'
  if (isAdminRole(user.role)) return '/dashboard'
  if (isSocioRole(user.role) || hasLinkedSocio(user)) {
    return hasLinkedSocio(user) ? '/dashboard' : '/cuenta-sin-socio'
  }
  return '/dashboard'
}
