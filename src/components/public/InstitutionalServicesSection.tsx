import type { ActionLink, LandingService } from '../../types/institutional'
import { PublicActionLink } from './PublicActionLink'

const TRAINING_EXTERNAL_URL = 'https://faatra.org.ar/capacitaciones/snit'

type ServiceCard = {
  key: string
  title: string
  badge: string
  description: string
  bullets: string[]
  cta: ActionLink
  icon: 'membresia' | 'data' | 'capacitacion' | 'auxilio'
}

type Props = {
  services?: LandingService[]
}

function isUnsafePublicHref(href?: string) {
  if (!href) return true
  const normalized = href.toLowerCase().trim()
  return (
    normalized.includes('admin') ||
    normalized.includes('/#/admin') ||
    normalized.includes('/admin') ||
    normalized.includes('login')
  )
}

function mapLandingServiceToCard(service: LandingService, index: number): ServiceCard {
  const fallbackCtas = [
    { label: 'Más información', url: '/institucional' },
    { label: 'Ver capacitaciones', url: TRAINING_EXTERNAL_URL },
    { label: 'Data técnica', url: '/data-tecnica' },
    { label: 'Consultar', url: '#contacto' },
  ]
  const fallback = fallbackCtas[index] ?? { label: 'Ver más', url: '#contacto' }

  const rawHref = service.cta_href?.trim() || fallback.url
  const trainingText = `${service.title} ${service.cta_label ?? ''} ${rawHref} ${service.icon ?? ''}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  const href =
    trainingText.includes('capacitacion') || trainingText.includes('capacitaciones')
      ? TRAINING_EXTERNAL_URL
      : isUnsafePublicHref(rawHref)
        ? fallback.url
        : rawHref

  const iconMap: Record<string, ServiceCard['icon']> = {
    representacion: 'membresia',
    capacitacion: 'capacitacion',
    data: 'data',
    red: 'auxilio',
  }

  return {
    key: `cms-${service.title}-${index}`,
    title: service.title,
    badge: 'Servicio institucional',
    description: service.description,
    bullets: [],
    cta: {
      label: service.cta_label?.trim() || fallback.label,
      url: href,
    },
    icon: iconMap[service.icon ?? ''] ?? (['membresia', 'capacitacion', 'data', 'auxilio'][index % 4] as ServiceCard['icon']),
  }
}

function resolveServiceCards(services?: LandingService[]): ServiceCard[] {
  const visible = (services ?? [])
    .filter((service) => service.visible !== false && service.title.trim())
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  if (visible.length > 0) {
    return visible.map(mapLandingServiceToCard)
  }

  return SERVICE_CARDS
}

const SERVICE_CARDS: ServiceCard[] = [
  {
    key: 'membresia',
    title: 'Membresía',
    badge: 'Acceso institucional',
    description:
      'Alta simplificada, acompañamiento inicial y acceso a beneficios para socios.',
    bullets: [
      'Alta institucional simplificada',
      'Acompañamiento en el proceso',
      'Agenda inicial de beneficios',
    ],
    cta: { label: 'Asociarme', url: '/asociarme' },
    icon: 'membresia',
  },
  {
    key: 'data-tecnica',
    title: 'Datos técnicos',
    badge: 'Consulta externa',
    description: 'Acceso a información técnica disponible a través de FAATRA / SNIT.',
    bullets: [
      'Boletines normativos',
      'Fichas técnicas del sector',
      'Alertas de actualización',
    ],
    cta: { label: 'Data técnica', url: '/data-tecnica' },
    icon: 'data',
  },
  {
    key: 'capacitacion',
    title: 'Capacitación',
    badge: 'Programa activo',
    description:
      'Espacios de formación para fortalecer la gestión y operación de los talleres.',
    bullets: [
      'Gestión comercial',
      'Formación legal y tributaria',
      'Entrenamientos operativos',
    ],
    cta: { label: 'Capacitaciones', url: TRAINING_EXTERNAL_URL },
    icon: 'capacitacion',
  },
  {
    key: 'auxilio',
    title: 'Auxilio institucional',
    badge: 'Acompañamiento',
    description:
      'Orientación inicial y derivación especializada para consultas del sector.',
    bullets: [
      'Asesoramiento inicial',
      'Derivación especializada',
      'Seguimiento de casos',
    ],
    cta: { label: 'Consultar', url: '#contacto' },
    icon: 'auxilio',
  },
]

function ServiceIcon({ kind }: { kind: ServiceCard['icon'] }) {
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

  if (kind === 'membresia') {
    return (
      <svg {...props}>
        <path d="M4.5 10.5 12 5l7.5 5.5" />
        <path d="M6.2 10.2v8.3h11.6v-8.3" />
        <path d="M9.2 18.5v-4.3h5.6v4.3" />
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

  if (kind === 'capacitacion') {
    return (
      <svg {...props}>
        <path d="M3.5 8.5 12 4l8.5 4.5L12 13 3.5 8.5Z" />
        <path d="M6.5 10.2v4.2c0 1.8 2.5 3.1 5.5 3.1s5.5-1.3 5.5-3.1v-4.2" />
      </svg>
    )
  }

  return (
    <svg {...props}>
      <path d="M12 20 4 12l4-4 4 4 4-4 4 4-8 8Z" />
      <path d="M12 7V4" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
      <path
        d="M4 10.5L8 14.5L16 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function InstitutionalServicesSection({ services }: Props) {
  const cards = resolveServiceCards(services)

  return (
    <section
      id="servicios"
      className="relative w-full overflow-hidden bg-transparent px-6 py-16 text-white sm:py-20 lg:px-8"
    >
      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 flex items-center justify-center gap-4">
            <span className="h-px w-9 bg-sky-300/45" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-sky-200">
              Servicios
            </p>
            <span className="h-px w-9 bg-sky-300/45" aria-hidden="true" />
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Servicios institucionales para socios
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-sky-100/88 sm:text-base">
            CRABB acompaña a talleres, comercios y profesionales del sector automotor con
            herramientas de gestión, información técnica y representación institucional.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {cards.map((card) => (
            <article
              key={card.key}
              className="group flex h-full flex-col rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_18px_44px_-34px_rgba(2,12,31,0.85)] ring-1 ring-white/[0.04] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-sky-200/25 hover:bg-white/[0.08] sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex rounded-full border border-sky-200/20 bg-sky-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-100/90">
                  {card.badge}
                </span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-200/16 bg-sky-300/10 text-sky-100">
                  <ServiceIcon kind={card.icon} />
                </span>
              </div>

              <h3 className="mt-4 text-xl font-semibold text-white">{card.title}</h3>
              <p className="mt-2 text-sm leading-7 text-sky-100/72">{card.description}</p>

              {card.bullets.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {card.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm text-sky-50/80">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-300/12 text-sky-100">
                        <CheckIcon />
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-auto pt-5">
                <PublicActionLink
                  link={card.cta}
                  className={
                    card.key === 'membresia'
                      ? 'inline-flex items-center rounded-full bg-sky-300/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#06213c] transition hover:bg-sky-200'
                      : 'inline-flex items-center rounded-full border border-sky-200/18 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-sky-100 transition hover:border-sky-200/35 hover:bg-sky-300/10 hover:text-white'
                  }
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
