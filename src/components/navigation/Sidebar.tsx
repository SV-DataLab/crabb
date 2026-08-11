import { NavLink } from 'react-router-dom'
import { DateTimeWidget } from '../layout/DateTimeWidget'
import { useAuth } from '../../hooks/useAuth'
import { getAdminNavItems, getMainNavItems } from './nav-items'

function NavItemLink({ item }: { item: { label: string; path: string } }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === '/admin/institucional'}
      className={({ isActive }) =>
        `block rounded-xl px-3 py-2 text-sm font-medium ${
          isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
        }`
      }
    >
      {item.label}
    </NavLink>
  )
}

export function Sidebar() {
  const { user } = useAuth()
  const mainItems = getMainNavItems(user?.role, user)
  const adminItems = getAdminNavItems(user?.role)
  const logoCrabbUrl = `${import.meta.env.BASE_URL}logo-crabb.jpg`

  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white p-4 md:flex">
      <div className="mb-6 flex items-center gap-3">
        <img src={logoCrabbUrl} alt="CRABB" className="h-10 w-10 rounded-md object-contain" />
        <div>
          <p className="text-xs text-slate-500">Cámara de Reparación</p>
          <p className="text-sm font-semibold text-slate-900">
            <span translate="no" className="notranslate">
              CRABB
            </span>
          </p>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {mainItems.map((item) => (
          <NavItemLink key={item.path} item={item} />
        ))}

        {adminItems.length > 0 ? (
          <div className="pt-3">
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Administración
            </p>
            <div className="space-y-1">
              {adminItems.map((item) => (
                <NavItemLink key={item.path} item={item} />
              ))}
            </div>
          </div>
        ) : null}
      </nav>

      <DateTimeWidget className="mt-4 hidden shrink-0 lg:block" />
    </aside>
  )
}
