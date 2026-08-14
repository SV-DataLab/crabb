import type {
  ActionLink,
  FooterContent,
  FooterLegalLink,
  InstitutionalContact,
  SocialLink,
} from '../../types/institutional'
import { useNavigate } from 'react-router-dom'
import { isSafeActionUrl, resolveVisibleSocialLinks } from '../../lib/actionLinks'
import type { PublicNavItem } from './PublicHeader'

const fallbackLegalLinks = [
  { label: 'Privacidad', url: '/privacidad' },
  { label: 'Términos', url: '/terminos' },
  { label: 'Eliminación de datos', url: '/eliminacion-de-datos' },
] satisfies ActionLink[]

function resolveLegalLinks(configured: FooterLegalLink[] | undefined): ActionLink[] {
  const links = (configured ?? [])
    .filter((link) => link.visible !== false)
    .filter((link) => link.label?.trim() && isSafeActionUrl(link.url ?? ''))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((link) => ({ label: link.label.trim(), url: link.url.trim() }))

  return links.length > 0 ? links : fallbackLegalLinks
}

type PublicFooterProps = {
  footer: FooterContent
  contact: InstitutionalContact
  socialLinks: SocialLink[]
  navItems: PublicNavItem[]
}

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
    <path
      d="M4.75 6.75h14.5v10.5H4.75V6.75Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="m5.25 7.25 6.75 5 6.75-5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
    <path
      d="M8.1 5.25 9.9 9.4l-1.45 1.05c.85 1.9 2.25 3.32 4.18 4.2l1.1-1.42 4.02 1.85-.58 3.02c-.14.73-.8 1.25-1.55 1.18C9.3 18.74 5.27 14.7 4.72 8.38c-.06-.75.46-1.41 1.18-1.55l2.2-.43Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
    <path
      d="M12 21s6.25-5.4 6.25-10.7A6.25 6.25 0 1 0 5.75 10.3C5.75 15.6 12 21 12 21Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M12 12.5a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
  </svg>
)

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
    <rect x="5" y="5" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path d="M16.4 7.7h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
)

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
    <path
      d="M13.3 20v-7h2.25l.45-3h-2.7V8.45c0-.82.4-1.45 1.55-1.45H16.1V4.3A15 15 0 0 0 13.85 4C11.6 4 10 5.37 10 7.9V10H7.75v3H10v7h3.3Z"
      fill="currentColor"
    />
  </svg>
)

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
    <path d="M6.5 9.5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M10.75 19v-9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M10.75 13.4c0-2.1 1.25-3.1 3.05-3.1 2.05 0 3.7 1.3 3.7 4.15V19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M6.5 6.2h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
    <rect x="3.5" y="6.5" width="17" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
    <path d="M10.5 9.8v4.4l4-2.2-4-2.2Z" fill="currentColor" />
  </svg>
)

const WhatsappIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
    <path
      d="M6 18.5 6.9 15A7.3 7.3 0 1 1 10 19.6l-4 .9Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M9.3 9.6c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .5.4.2.4.6 1.4.6 1.5.1.1.1.3 0 .4-.1.2-.1.3-.3.4-.1.2-.3.3-.4.5-.1.1-.3.3-.1.6.2.3.8 1.2 1.6 1.9 1.1 1 2 1.2 2.3 1.4.3.1.5.1.6-.1.2-.2.7-.8.9-1 .2-.3.3-.2.6-.1l1.5.7c.2.1.3.2.4.3.1.2.1.9-.2 1.4-.3.5-1.4 1.1-1.9 1.1-.5 0-1.1.1-3.6-1s-4-3.4-4.2-3.7c-.1-.2-1-1.3-1-2.6 0-1.2.6-1.8.8-2.1Z"
      fill="currentColor"
    />
  </svg>
)

const GenericLinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
    <path d="M4 12h16M12 4c2.4 2.2 2.4 13.8 0 16M12 4c-2.4 2.2-2.4 13.8 0 16" stroke="currentColor" strokeWidth="1.6" />
  </svg>
)

function resolveSocialIcon(platform: string) {
  const normalized = platform.toLowerCase()
  if (normalized.includes('instagram')) return <InstagramIcon />
  if (normalized.includes('facebook')) return <FacebookIcon />
  if (normalized.includes('linkedin')) return <LinkedinIcon />
  if (normalized.includes('youtube')) return <YoutubeIcon />
  if (normalized.includes('whatsapp')) return <WhatsappIcon />
  return <GenericLinkIcon />
}

export function PublicFooter({ footer, contact, socialLinks, navItems }: PublicFooterProps) {
  const navigate = useNavigate()
  const legalLinks = resolveLegalLinks(footer.legal_links)

  const handleFooterNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (/^https?:\/\//i.test(href)) return

    if (!href.startsWith('#')) {
      event.preventDefault()
      navigate(href)
      return
    }

    event.preventDefault()

    document.querySelector(href)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const footerConfig = {
    brand: 'CRABB',
    description: 'Cámara de Reparación de Automotores de Bahía Blanca',
    summary: footer.description,
    contact: {
      email: contact.email,
      phone: contact.phone,
      location: contact.address,
    },
    navLinks: navItems,
    socials: resolveVisibleSocialLinks(socialLinks).map((link) => ({
      label: link.label?.trim() || link.platform.trim(),
      href: link.url.trim(),
      icon: resolveSocialIcon(link.platform),
    })),
  }

  return (
    <footer className="relative w-full overflow-hidden bg-[#061f3d] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_92%_80%,rgba(96,165,250,0.15),transparent_32%),linear-gradient(135deg,#082a52_0%,#051b35_56%,#031327_100%)]"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full border border-white/10"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full border border-white/10"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 translate-x-20 translate-y-24 rounded-full border border-white/10 opacity-70"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute bottom-8 right-8 hidden text-white/[0.045] lg:block"
        aria-hidden="true"
      >
        <svg viewBox="0 0 220 220" fill="none" className="h-56 w-56">
          <path
            d="M110 36v22M110 162v22M36 110h22M162 110h22M57.7 57.7l15.5 15.5M146.8 146.8l15.5 15.5M162.3 57.7l-15.5 15.5M73.2 146.8l-15.5 15.5"
            stroke="currentColor"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <circle cx="110" cy="110" r="48" stroke="currentColor" strokeWidth="18" />
          <circle cx="110" cy="110" r="92" stroke="currentColor" strokeWidth="10" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.95fr_1fr] lg:gap-16">
          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white shadow-xl shadow-black/25">
                <img
                  src="/logo-crabb.jpg"
                  alt="Logo CRABB"
                  className="h-full w-full object-contain p-1.5"
                />
              </div>

              <div>
                <p className="text-3xl font-black tracking-tight text-white">
                  {footerConfig.brand}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/75">
                  Institucional
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-sm text-base font-semibold leading-snug text-white">
              {footerConfig.description}
            </p>

            <p className="mt-4 max-w-sm text-sm leading-7 text-blue-100/82">
              {footerConfig.summary}
            </p>
          </div>

          <nav aria-label="Navegación del pie de página">
            <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-white">
              Navegación
            </h4>

            <ul className="mt-6 grid grid-cols-2 gap-x-10 gap-y-3">
              {footerConfig.navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    onClick={(event) => handleFooterNavClick(event, link.href)}
                    className="text-sm text-blue-50/82 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#061f3d]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-white">
              Contacto
            </h4>

            <div className="mt-6 space-y-4 text-sm text-blue-50/86">
              <a
                href={`mailto:${footerConfig.contact.email}`}
                className="flex items-center gap-3 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#061f3d]"
              >
                <span className="text-sky-200">
                  <MailIcon />
                </span>
                <span>{footerConfig.contact.email}</span>
              </a>

              <p className="flex items-center gap-3">
                <span className="text-sky-200">
                  <LocationIcon />
                </span>
                <span>{footerConfig.contact.location}</span>
              </p>

              <a
                href={`tel:${footerConfig.contact.phone}`}
                className="flex items-center gap-3 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#061f3d]"
              >
                <span className="text-sky-200">
                  <PhoneIcon />
                </span>
                <span>{footerConfig.contact.phone}</span>
              </a>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              {footerConfig.socials.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={`Abrir ${item.label}`}
                  title={item.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.06] text-white transition hover:-translate-y-0.5 hover:border-sky-200/70 hover:bg-white/14 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#061f3d]"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-blue-100/68">
            {footer.copyright ||
              '© CRABB Bahía Blanca · Todos los derechos reservados.'}
          </p>

          <nav aria-label="Enlaces legales" className="flex flex-wrap gap-x-5 gap-y-2">
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.url}
                onClick={(event) => handleFooterNavClick(event, link.url)}
                className="text-xs text-blue-50/82 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#061f3d]"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}