import type { InstitutionalContact, LandingFinalCta, SocialLink } from '../../types/institutional'
import { PublicActionLink } from './PublicActionLink'

type ContactCommunitySectionProps = {
  contact: InstitutionalContact
  socialLinks: SocialLink[]
  finalCta: LandingFinalCta
  showContact: boolean
  showSocialLinks: boolean
}

type SocialContactLink = {
  label: string
  href: string
}

function ContactIcon({ kind }: { kind: 'institution' | 'users' | 'education' | 'mail' | 'phone' | 'clock' }) {
  if (kind === 'institution') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M4 20H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M6 20V10L12 6L18 10V20" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 20V14H15V20" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    )
  }

  if (kind === 'users') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M16 18V16.5C16 15.12 14.21 14 12 14C9.79 14 8 15.12 8 16.5V18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 12.5C13.66 12.5 15 11.16 15 9.5C15 7.84 13.66 6.5 12 6.5C10.34 6.5 9 7.84 9 9.5C9 11.16 10.34 12.5 12 12.5Z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    )
  }

  if (kind === 'education') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M3.5 10.5L12 6L20.5 10.5L12 15L3.5 10.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M7 12.5V15.2C7 16.6 9.2 18 12 18C14.8 18 17 16.6 17 15.2V12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  if (kind === 'mail') {
    return (
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
        <path d="M4 6H20V18H4V6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M4 8L12 13L20 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (kind === 'phone') {
    return (
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
        <path d="M7 4.5H9L10.2 8.2L8.8 9.6C9.8 11.7 12.3 14.2 14.4 15.2L15.8 13.8L19.5 15V17C19.5 18.1 18.6 19 17.5 19C10.1 19 5 13.9 5 6.5C5 5.4 5.9 4.5 7 4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
      <path d="M12 8V12L14.5 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 12C6.5 8.9 8.9 6.5 12 6.5C15.1 6.5 17.5 8.9 17.5 12C17.5 15.1 15.1 17.5 12 17.5C8.9 17.5 6.5 15.1 6.5 12Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function ContactCommunitySection({
  contact,
  socialLinks,
  finalCta,
  showContact,
  showSocialLinks,
}: ContactCommunitySectionProps) {
  // TODO: reemplazar esta configuracion local por datos administrables desde Superadmin.
  const contactConfig = {
    address: contact.address || 'Bahía Blanca, Buenos Aires, Argentina',
    email: contact.email || 'info@crabb.com',
    phone: contact.phone || '+54 291 400-0000',
    hours: contact.hours || 'Lunes a viernes de 8:00 a 16:00',
    socials: [
      {
        label: 'Instagram',
        href: socialLinks.find((link) => link.platform.toLowerCase().includes('instagram'))?.url || '#',
      },
      {
        label: 'Facebook',
        href: socialLinks.find((link) => link.platform.toLowerCase().includes('facebook'))?.url || '#',
      },
      {
        label: 'LinkedIn',
        href: socialLinks.find((link) => link.platform.toLowerCase().includes('linkedin'))?.url || '#',
      },
    ] satisfies SocialContactLink[],
  }

  const supportPoints = [
    {
      icon: 'institution' as const,
      title: 'Representación y gestiones',
      description: 'Consultas vinculadas a trámites, instituciones y necesidades del sector.',
    },
    {
      icon: 'users' as const,
      title: 'Consultas para asociados',
      description: 'Acompañamiento inicial para empresas y profesionales vinculados a CRABB.',
    },
    {
      icon: 'education' as const,
      title: 'Capacitaciones y recursos técnicos',
      description: 'Información sobre programas, formación y data técnica disponible.',
    },
  ]

  return (
    <section id="contacto" className="relative w-full overflow-hidden bg-gradient-to-b from-slate-100 via-[#f5f9ff] to-[#edf3fb] pb-10 pt-16 sm:pb-12 sm:pt-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(56,189,248,0.12),transparent_36%),radial-gradient(circle_at_86%_22%,rgba(30,64,175,0.08),transparent_34%)]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-300/80 to-transparent" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">CONTACTO INSTITUCIONAL</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 md:text-4xl lg:text-[2.65rem]">
              Contactá con CRABB
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
              Estamos para acompañar a talleres, concesionarias, agencias y empresas vinculadas al ecosistema automotor
              regional.
            </p>

            <div className="mt-7 space-y-3.5 sm:space-y-4">
              {supportPoints.map((point) => (
                <article
                  key={point.title}
                  className="group rounded-2xl border border-slate-200/85 bg-white/90 p-4 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.3)] backdrop-blur-sm transition duration-250 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_34px_-20px_rgba(15,23,42,0.34)] sm:p-5"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700 ring-1 ring-white transition duration-200 group-hover:border-blue-200 group-hover:bg-blue-100/80 sm:h-11 sm:w-11">
                      <ContactIcon kind={point.icon} />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{point.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{point.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-[#113059] via-[#0f2747] to-[#0b1f3a] p-5 text-white shadow-[0_26px_58px_-34px_rgba(15,39,71,0.92)] ring-1 ring-slate-900/10 sm:p-7">
            <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full border border-white/10 bg-white/5" aria-hidden="true" />
            <div className="pointer-events-none absolute bottom-0 left-8 h-20 w-20 rounded-full bg-blue-300/12 blur-xl" aria-hidden="true" />

            <div className="relative">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
              <span className="inline-flex h-2 w-2 rounded-full bg-blue-300" aria-hidden="true" />
              Atención CRABB
            </div>

            <div className="mt-5 space-y-4">
              {showContact ? (
                <div className="space-y-3 text-sm text-blue-50">
                  <div className="flex items-start gap-3 rounded-2xl border border-white/12 bg-white/6 px-4 py-3">
                    <span className="mt-0.5 text-blue-200">
                      <ContactIcon kind="institution" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">Dirección</p>
                      <p className="mt-1 leading-relaxed">{contactConfig.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-white/12 bg-white/6 px-4 py-3">
                    <span className="mt-0.5 text-blue-200">
                      <ContactIcon kind="mail" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">Email</p>
                      <a
                        href={`mailto:${contactConfig.email}`}
                        className="mt-1 inline-flex break-all text-blue-50 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f2747]"
                      >
                        {contactConfig.email}
                      </a>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-2xl border border-white/12 bg-white/6 px-4 py-3">
                      <span className="mt-0.5 text-blue-200">
                        <ContactIcon kind="phone" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">Teléfono</p>
                        <a
                          href={`tel:${contactConfig.phone}`}
                          className="mt-1 inline-flex text-blue-50 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f2747]"
                        >
                          {contactConfig.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-white/12 bg-white/6 px-4 py-3">
                      <span className="mt-0.5 text-blue-200">
                        <ContactIcon kind="clock" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">Horarios</p>
                        <p className="mt-1 leading-relaxed text-blue-50">{contactConfig.hours}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-2.5 pt-2 sm:grid-cols-2">
                <PublicActionLink
                  link={finalCta.primary_cta}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#0f2747] transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f2747]"
                />
                <PublicActionLink
                  link={finalCta.secondary_cta}
                  className="inline-flex items-center justify-center rounded-full border border-white/24 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f2747]"
                />
              </div>

              {showSocialLinks ? (
                <div className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Redes sociales</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {contactConfig.socials.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target={social.href.startsWith('http') ? '_blank' : undefined}
                        rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        aria-label={`Abrir ${social.label}`}
                        className="rounded-full border border-white/18 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-blue-50 transition hover:border-white/34 hover:bg-white/[0.14] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f2747]"
                      >
                        {social.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
