import { Outlet, useLocation } from 'react-router-dom'
import { TopHeader } from '../../components/layout/TopHeader'
import { BottomNav } from '../../components/navigation/BottomNav'
import { Sidebar } from '../../components/navigation/Sidebar'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/institucional': 'Institucional',
  '/capacitaciones': 'Capacitaciones',
  '/data-tecnica': 'Data Técnica',
  '/perfil': 'Gestión de Socios',
  '/colegas': 'Buscar colegas',
  '/mi-carnet': 'Mi carnet',
  '/mi-perfil': 'Mi perfil',
  '/cuenta-sin-socio': 'Cuenta sin socio',
  '/admin': 'Administración',
  '/admin/institucional': 'Página institucional',
  '/admin/sitio-web': 'Sitio Web',
  '/admin/sitio-web/portada': 'Portada',
  '/admin/sitio-web/navegacion': 'Navegación',
  '/admin/sitio-web/sobre-crabb': 'Sobre CRABB',
  '/admin/sitio-web/servicios': 'Servicios',
  '/admin/sitio-web/oportunidades': 'Oportunidades',
  '/admin/sitio-web/contacto-redes': 'Contacto',
  '/admin/sitio-web/footer': 'Footer',
  '/admin/gestion-cobranzas': 'Gestión de cobranzas',
  '/admin/cuotas': 'Cuotas de socios',
}

export function AppShell() {
  const location = useLocation()
  const title = titles[location.pathname] ?? 'CRABB'

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-slate-50 md:flex">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <TopHeader title={title} />
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
