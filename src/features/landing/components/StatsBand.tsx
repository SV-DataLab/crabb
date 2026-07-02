import type { LandingStat } from '../constants'
import { DEFAULT_LANDING_STATS } from '../constants'
import { LandingReveal } from './LandingReveal'

type Props = {
  stats?: LandingStat[]
}

export function StatsBand({ stats = DEFAULT_LANDING_STATS }: Props) {
  return (
    <section
      aria-label="Indicadores institucionales"
      className="relative border-y border-white/10 bg-[#071b33]/90 px-6 py-10 backdrop-blur-sm lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <LandingReveal key={stat.label} delayMs={index * 80}>
            <article className="group rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5 text-center transition duration-300 hover:border-sky-300/30 hover:bg-white/[0.07]">
              <p className="text-2xl font-bold tracking-tight text-sky-200 sm:text-3xl">{stat.value}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300/90">
                {stat.label}
              </p>
            </article>
          </LandingReveal>
        ))}
      </div>
    </section>
  )
}
