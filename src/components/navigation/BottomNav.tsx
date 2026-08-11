import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getNavItems } from './nav-items'

export function BottomNav() {
  const { user } = useAuth()
  const navItems = getNavItems(user?.role, user)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white px-2 py-2 md:hidden">
      <ul className="grid gap-1" style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}>
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex min-h-12 items-center justify-center rounded-lg px-1 text-center text-[11px] ${
                  isActive ? 'bg-blue-100 font-semibold text-blue-700' : 'text-slate-600'
                }`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
