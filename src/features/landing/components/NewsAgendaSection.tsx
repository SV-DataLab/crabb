import { NEWS_AGENDA_ITEMS } from '../constants'
import { LandingReveal } from './LandingReveal'
import { LandingSectionHeader } from './LandingSectionHeader'

export function NewsAgendaSection() {
  return (
    <section id="novedades" className="relative w-full px-6 py-16 text-white sm:py-20 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <LandingReveal>
          <LandingSectionHeader
            light
            eyebrow="Novedades"
            title="Agenda y actividad institucional"
            description="CRABB mantiene una agenda activa de encuentros, capacitaciones y actualizaciones para el sector."
          />
        </LandingReveal>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {NEWS_AGENDA_ITEMS.map((item, index) => (
            <LandingReveal key={item.key} delayMs={index * 80}>
              <article className="flex h-full flex-col rounded-[1.35rem] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200/25 hover:bg-white/[0.08]">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full border border-sky-200/20 bg-sky-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-100">
                    {item.category}
                  </span>
                  <time className="text-xs text-sky-200/70">{item.date}</time>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-sky-100/75">{item.excerpt}</p>
                <p className="mt-4 text-xs text-sky-200/55">Contenido administrable · próximamente CMS</p>
              </article>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
