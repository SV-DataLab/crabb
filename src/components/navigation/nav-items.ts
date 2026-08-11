import type { NavItem } from '../../types'
import type { AuthUser } from '../../types/auth'
import { isAdminRole } from '../../utils/adminAccess'
import { isSocioRole, isSocioUser } from '../../utils/socioAccess'

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Institucional', path: '/institucional' },
  { label: 'Buscar colegas', path: '/colegas' },
  { label: 'Data Técnica', path: '/data-tecnica' },
  { label: 'Capacitaciones', path: '/capacitaciones' },
]

const socioNavItems: NavItem[] = [
  { label: 'Mi carnet', path: '/mi-carnet' },
  { label: 'Mi perfil', path: '/mi-perfil' },
]

const adminNavItems: NavItem[] = [
  { label: 'Gestión de socios', path: '/perfil' },
  { label: 'Solicitudes de socios', path: '/admin/solicitudes-socios' },
  { label: 'Cuotas de socios', path: '/admin/cuotas' },
  { label: 'Gestión de cobranzas', path: '/admin/gestion-cobranzas' },
  { label: 'Sitio Web', path: '/admin/sitio-web' },
  { label: 'Página institucional', path: '/admin/institucional' },
]

export function getMainNavItems(role?: string, user?: AuthUser | null): NavItem[] {
  if (isAdminRole(role)) {
    return mainNavItems.filter((item) => item.path !== '/colegas')
  }

  if (user ? isSocioUser(user) : isSocioRole(role)) {
    return [...mainNavItems, ...socioNavItems]
  }

  return mainNavItems
}

export function getAdminNavItems(role?: string): NavItem[] {
  return isAdminRole(role) ? adminNavItems : []
}

export function getNavItems(role?: string, user?: AuthUser | null): NavItem[] {
  return [...getMainNavItems(role, user), ...getAdminNavItems(role)]
}
