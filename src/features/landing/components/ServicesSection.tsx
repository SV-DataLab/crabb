import { PublicActionLink } from '../../../components/public/PublicActionLink'
import { LANDING_SERVICES, type ServiceCardData } from '../constants'
import { LandingReveal } from './LandingReveal'
import { LandingSectionHeader } from './LandingSectionHeader'

function ServiceIcon({ kind }: { kind: ServiceCardData['icon'] }) {
  const props = {
    className: 'h-5 w-5',
    fill: 'none' as const,
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  if (kind === 'institution') {
    return (
      <svg {...props}>
        <path d="M4 20h16" />
        <path d="M6 20V10l6-4 6 4v10" />
        <path d="M9 20v-5h6v5" />
      </svg>
    )
  }

  if (kind === 'training') {
    return (
      <svg {...props}>
        <path d="M3.5 8.5 12 4l8.5 4.5L12 13 3.5 8.5Z" />
        <path d="M6.5 10.2v4.2c0 1.8 2.5 3.1 5.5 3.1s5.5-1.3 5.5-3.1v-4.2" />
      </svg>
    )
  }

  if (kind === 'data') {
    return (
      <svg {...props}>
        <path d="M7 3.8h7.2L19 8.6V20a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 20V5A1.2 1.2 0 0 1 7 3.8Z" />
        <path d="M14 4v4.8h4.8" />
        <path d="M8.8 16.8v-3.1" />
        <path d="M12 16.8v-5.4" />
        <path d="M15.2 16.8v-2.2" />
      </svg>
    )
  }

  if (kind === 'members') {
    return (
      <svg {...props}>
        <path d="M16 18v-1.5a3.5 3.5 0 0 0-7 0V18" />
        <path d="M12.5 11.5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z" />
        <path d="M18.5 12a2 2 0 1 0-4 0" />
        <path d="M20 18v-1a3 3 0 0 0-2.2-2.9" />
      </svg>
    )
  }

  if (kind === 'comms') {
    return (
      <svg {...props}>
        <path d="M4 6h16v10H7l-3 3V6Z" />
        <path d="M8 10h8" />
        <path d="M8 13.5h5" />
      </svg>
    )
  }

  return (
    <svg {...props}>
      <path d="M4 12a8 8 0 0 1 16 0" />
      <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M6 20c1.5-2.5 4-4 6-4s4.5 1.5 6 4" />
    </svg>
  )
}

export function ServicesSection() {
  return (
    <section id="servicios" className="relative w-full px-6 py-16 text-white sm:py-20 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <LandingReveal>
          <LandingSectionHeader
            light
            eyebrow="Servicios"
            title="Servicios institucionales para el sector"
            description="Herramientas, información y acompañamiento para socios, talleres y comercios del ecosistema automotor regional."
          />
        </LandingReveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {LANDING_SERVICES.map((card, index) => (
            <LandingReveal key={card.key} delayMs={index * 60}>
              <article className="group flex h-full flex-col rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_18px_44px_-34px_rgba(2,12,31,0.85)] ring-1 ring-white/[0.04] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-sky-200/25 hover:bg-white/[0.08] sm:p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-sky-200/16 bg-sky-300/10 text-sky-100 transition group-hover:border-sky-200/35 group-hover:bg-sky-300/15">
                  <ServiceIcon kind={card.icon} />
                </span>

                <h3 className="mt-4 text-xl font-semibold text-white">{card.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-7 text-sky-100/72">{card.description}</p>

                {card.cta ? (
                  <div className="mt-5 pt-2">
                    <PublicActionLink
                      link={card.cta}
                      className="inline-flex items-center rounded-full border border-sky-200/18 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-sky-100 transition hover:border-sky-200/35 hover:bg-sky-300/10 hover:text-white"
                    />
                  </div>
                ) : null}
              </article>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
