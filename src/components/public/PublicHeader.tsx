import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export type PublicNavItem = {
  label: string
  href: string
}

type PublicHeaderProps = {
  navItems: PublicNavItem[]
}

const CRABB_LOGO_SRC = '/logo-crabb.jpg'

export function PublicHeader({ navItems }: PublicHeaderProps) {
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
      <div className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between px-6 lg:h-[4.75rem] lg:px-8">
        <div className="flex flex-shrink-0 basis-auto items-center lg:basis-[36%]">
          <a href="#inicio" className="inline-flex items-center gap-3">
            <span className="inline-flex rounded-md bg-white/95 p-1.5 shadow-[0_8px_18px_rgba(2,6,23,0.14)] ring-1 ring-slate-200/70">
              <img src={CRABB_LOGO_SRC} alt="CRABB" className="h-9 w-auto md:h-10.5" loading="eager" />
            </span>
            <div className="min-w-0 self-center">
              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-sky-200/90 md:text-[10px]">
                CÁMARA DE REPARACIÓN DE AUTOMOTORES
              </p>
              <p className="mt-0.5 text-sm font-semibold leading-tight text-white md:text-[0.95rem]">
                Bahía Blanca
              </p>
            </div>
          </a>
        </div>

        <div className="hidden flex-1 items-center justify-center lg:flex lg:basis-[40%]">
          <nav className="flex items-center gap-3.5 xl:gap-4.5">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                onClick={(event) => handleNavItemClick(event, item)}
                className={`rounded-full px-2.5 py-1.5 text-[0.83rem] font-medium transition duration-200 ${
                  isActiveItem(item.href)
                    ? 'bg-white/8 text-white ring-1 ring-white/10'
                    : 'text-slate-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                {displayLabel(item.label)}
              </a>
            ))}
          </nav>
        </div>

        <div className="hidden flex-shrink-0 items-center justify-end gap-2 lg:flex lg:basis-[24%]">
          <Link
            to="/asociarme"
            className="whitespace-nowrap rounded-full border border-sky-300/35 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-sky-100 transition hover:border-sky-200 hover:bg-white/8 hover:text-white"
          >
            Asociarme
          </Link>
          <Link
            to="/login"
            className="whitespace-nowrap rounded-full bg-cyan-400 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-950 shadow-sm transition hover:bg-cyan-300"
          >
            Ingreso Socios
          </Link>
          <Link
            to="/login"
            className="whitespace-nowrap rounded-full border border-white/18 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Admin
          </Link>
        </div>

        <button
          type="button"
          className="rounded-md border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-100 lg:hidden"
          onClick={() => setMenuOpen((value) => !value)}
        >
          Menu
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-white/10 bg-[#071528] px-6 py-4 lg:hidden">
          <nav className="grid gap-3">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="text-sm font-medium text-slate-200"
                onClick={(event) => handleNavItemClick(event, item, true)}
              >
                {displayLabel(item.label)}
              </a>
            ))}
            <Link
              to="/asociarme"
              className="inline-flex w-fit rounded-full border border-sky-300/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-sky-100 transition hover:bg-white/10"
              onClick={() => setMenuOpen(false)}
            >
              Asociarme / Activar cuenta
            </Link>
            <Link
              to="/login"
              className="mt-2 inline-flex w-fit rounded-full bg-cyan-400 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-950 transition hover:bg-cyan-300"
              onClick={() => setMenuOpen(false)}
            >
              Ingreso Socios
            </Link>
            <Link
              to="/login"
              className="inline-flex w-fit rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100 transition hover:bg-white/10"
              onClick={() => setMenuOpen(false)}
            >
              Admin
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
