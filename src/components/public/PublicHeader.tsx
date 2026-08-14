import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isProtectedInternalPath } from '../../lib/actionLinks'

export type PublicNavItem = {
  label: string
  href: string
}

type PublicHeaderProps = {
  navItems: PublicNavItem[]
  brandEyebrow?: string
  brandName?: string
  logoUrl?: string
}

const CRABB_LOGO_SRC = '/logo-crabb.jpg'

const FOCUS_RING =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06111f]'

function LockBadge() {
  return (
    <span
      className="ml-1 inline-flex h-3.5 w-3.5 items-center justify-center align-middle text-sky-300/80"
      aria-hidden="true"
      title="Requiere ingreso de socios"
    >
      <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none">
        <rect x="4.5" y="8.5" width="11" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M6.75 8.5V6a3.25 3.25 0 0 1 6.5 0v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M4 6.5h16M4 12h16M4 17.5h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function PublicHeader({
  navItems,
  brandEyebrow = 'CÁMARA DE REPARACIÓN DE AUTOMOTORES',
  brandName = 'Bahía Blanca',
  logoUrl = CRABB_LOGO_SRC,
}: PublicHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const displayLabel = (label: string) => {
    if (label.toLowerCase() === 'data tecnica') return 'Data Técnica'
    return label
  }

  const isActiveItem = (href: string) => {
    if (/^https?:\/\//i.test(href)) return false

    if (href.startsWith('#')) {
      if (href === '#inicio') {
        return location.pathname === '/' && (!location.hash || location.hash === '#inicio')
      }

      return location.pathname === '/' && location.hash === href
    }

    return location.pathname === href
  }

  const handleNavItemClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    item: PublicNavItem,
    shouldCloseMenu = false,
  ) => {
    if (/^https?:\/\//i.test(item.href)) {
      if (shouldCloseMenu) setMenuOpen(false)
      return
    }

    if (!item.href.startsWith('#')) {
      event.preventDefault()
      navigate(item.href)
      if (shouldCloseMenu) setMenuOpen(false)
      return
    }

    event.preventDefault()

    document.querySelector(item.href)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })

    if (shouldCloseMenu) setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#06111f]/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 lg:h-[4.25rem] lg:px-8">
        <div className="flex flex-shrink-0 basis-auto items-center lg:basis-[36%]">
          <a href="#inicio" className={`inline-flex items-center gap-3 rounded-md ${FOCUS_RING}`}>
            <span className="inline-flex rounded-md bg-white/95 p-1.5 shadow-[0_8px_18px_rgba(2,6,23,0.14)] ring-1 ring-slate-200/70">
              <img src={logoUrl || CRABB_LOGO_SRC} alt="CRABB" className="h-9 w-auto md:h-10" loading="eager" />
            </span>
            <div className="min-w-0 self-center">
              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-sky-200/90 md:text-[10px]">
                {brandEyebrow}
              </p>
              <p className="mt-0.5 text-sm font-semibold leading-tight text-white md:text-[0.95rem]">
                {brandName}
              </p>
            </div>
          </a>
        </div>

        <div className="hidden flex-1 items-center justify-center lg:flex lg:basis-[44%]">
          <nav aria-label="Navegación principal" className="flex items-center gap-3.5 xl:gap-4.5">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                onClick={(event) => handleNavItemClick(event, item)}
                className={`rounded-full px-2.5 py-1.5 text-[0.83rem] font-medium transition duration-200 ${FOCUS_RING} ${
                  isActiveItem(item.href)
                    ? 'bg-white/8 text-white ring-1 ring-white/10'
                    : 'text-slate-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                {displayLabel(item.label)}
                {isProtectedInternalPath(item.href) ? <LockBadge /> : null}
              </a>
            ))}
          </nav>
        </div>

        <div className="hidden flex-shrink-0 items-center justify-end gap-2 lg:flex lg:basis-[20%]">
          <Link
            to="/asociarme"
            className={`whitespace-nowrap rounded-full border border-sky-300/35 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-sky-100 transition hover:border-sky-200 hover:bg-white/8 hover:text-white ${FOCUS_RING}`}
          >
            Asociarme
          </Link>
          <Link
            to="/login"
            className={`whitespace-nowrap rounded-full bg-cyan-400 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-950 shadow-sm transition hover:bg-cyan-300 ${FOCUS_RING}`}
          >
            Ingreso Socios
          </Link>
        </div>

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="public-mobile-menu"
          aria-label={menuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          className={`inline-flex items-center justify-center rounded-md border border-white/20 p-2 text-slate-100 lg:hidden ${FOCUS_RING}`}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <MenuIcon open={menuOpen} />
        </button>
      </div>

      {menuOpen ? (
        <div id="public-mobile-menu" className="border-t border-white/10 bg-[#071528] px-6 py-4 lg:hidden">
          <nav aria-label="Navegación principal móvil" className="grid gap-3">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`rounded-md text-sm font-medium text-slate-200 ${FOCUS_RING}`}
                onClick={(event) => handleNavItemClick(event, item, true)}
              >
                {displayLabel(item.label)}
                {isProtectedInternalPath(item.href) ? <LockBadge /> : null}
              </a>
            ))}
            <Link
              to="/asociarme"
              className={`inline-flex w-fit rounded-full border border-sky-300/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-sky-100 transition hover:bg-white/10 ${FOCUS_RING}`}
              onClick={() => setMenuOpen(false)}
            >
              Asociarme / Activar cuenta
            </Link>
            <Link
              to="/login"
              className={`mt-2 inline-flex w-fit rounded-full bg-cyan-400 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-950 transition hover:bg-cyan-300 ${FOCUS_RING}`}
              onClick={() => setMenuOpen(false)}
            >
              Ingreso Socios
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
