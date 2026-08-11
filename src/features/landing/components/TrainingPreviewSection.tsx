import { PublicActionLink } from '../../../components/public/PublicActionLink'
import { LANDING_IMAGES, TRAINING_EXTERNAL_URL, TRAINING_PREVIEW_CARDS } from '../constants'
import { LandingImage } from './LandingImage'
import { LandingReveal } from './LandingReveal'
import { LandingSectionHeader } from './LandingSectionHeader'

export function TrainingPreviewSection() {
  return (
    <section id="capacitaciones" className="relative w-full px-6 py-16 text-white sm:py-20 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <LandingReveal>
            <div className="overflow-hidden rounded-[1.5rem] border border-white/10 shadow-2xl shadow-black/20">
              <LandingImage
                src={LANDING_IMAGES.training}
                alt="Capacitaciones técnicas para el sector automotor"
                className="min-h-[260px] w-full object-cover object-center"
              />
            </div>
          </LandingReveal>

          <div>
            <LandingReveal delayMs={60}>
              <LandingSectionHeader
                light
                align="left"
                eyebrow="Capacitaciones"
                title="Formación para talleres y equipos"
                description="Programas orientados a diagnóstico, gestión y actualización técnica del sector automotor."
              />
            </LandingReveal>

            <div className="mt-8 grid gap-4">
              {TRAINING_PREVIEW_CARDS.map((card, index) => (
                <LandingReveal key={card.key} delayMs={100 + index * 70}>
                  <article className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 transition duration-300 hover:border-sky-200/25 hover:bg-white/[0.08]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-sky-200/20 bg-sky-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-100">
                        {card.tag}
                      </span>
                      <span className="text-xs text-sky-200/75">{card.date}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-white">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-sky-100/75">{card.description}</p>
                  </article>
                </LandingReveal>
              ))}
            </div>

            <LandingReveal delayMs={320}>
              <div className="mt-6">
                <PublicActionLink
                  link={{ label: 'Ver capacitaciones', url: TRAINING_EXTERNAL_URL }}
                  className="inline-flex items-center justify-center rounded-full bg-sky-300 px-5 py-3 text-sm font-bold text-[#06213c] transition hover:bg-sky-200"
                />
              </div>
            </LandingReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
