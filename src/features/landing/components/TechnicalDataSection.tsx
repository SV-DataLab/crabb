import { PublicActionLink } from '../../../components/public/PublicActionLink'
import { LANDING_IMAGES, TECHNICAL_DATA_CARDS } from '../constants'
import { LandingImage } from './LandingImage'
import { LandingReveal } from './LandingReveal'
import { LandingSectionHeader } from './LandingSectionHeader'

export function TechnicalDataSection() {
  return (
    <section
      id="data-tecnica"
      className="relative w-full bg-gradient-to-b from-[#f5f9ff] via-white to-[#edf3fb] px-6 py-16 sm:py-20 lg:px-8"
    >
      <div className="relative mx-auto max-w-7xl">
        <LandingReveal>
          <LandingSectionHeader
            eyebrow="Data Técnica"
            title="Panel técnico para decisiones informadas"
            description="Documentación, normativas y recursos para talleres y profesionales que necesitan información actualizada."
          />
        </LandingReveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <div className="grid gap-4 sm:grid-cols-2">
            {TECHNICAL_DATA_CARDS.map((card, index) => (
              <LandingReveal key={card.key} delayMs={index * 70}>
                <article className="group h-full rounded-2xl border border-slate-200/90 bg-[#0b1f3a] p-5 text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:border-sky-300/35 hover:shadow-xl">
                  <div className="mb-3 h-1 w-10 rounded-full bg-sky-400/80" aria-hidden="true" />
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-sky-100/75">{card.description}</p>
                </article>
              </LandingReveal>
            ))}
          </div>

          <LandingReveal delayMs={200}>
            <div className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-xl">
              <LandingImage
                src={LANDING_IMAGES.technicalData}
                alt="Recursos técnicos y documentación del sector automotor"
                className="h-48 w-full object-cover object-center sm:h-56"
              />
              <div className="flex flex-1 flex-col p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                  Recursos técnicos
                </p>
                <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
                  Consultá manuales, normativas y recomendaciones técnicas disponibles para socios y
                  referentes del sector.
                </p>
                <PublicActionLink
                  link={{ label: 'Explorar Data Técnica', url: '/data-tecnica' }}
                  className="mt-5 inline-flex w-fit items-center justify-center rounded-full bg-[#0f2747] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#12335d]"
                />
              </div>
            </div>
          </LandingReveal>
        </div>
      </div>
    </section>
  )
}
