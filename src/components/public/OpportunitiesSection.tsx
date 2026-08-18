import type { LandingSection } from '../../types/institutional'

type Props = {
  opportunities?: LandingSection
}

function hasText(value: string | undefined | null): boolean {
  return Boolean(value && value.trim().length > 0)
}

function hasOpportunitiesContent(section?: LandingSection): boolean {
  if (!section) return false
  return hasText(section.title) || hasText(section.description) || section.items.some(hasText)
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

export function OpportunitiesSection({ opportunities }: Props) {
  if (!hasOpportunitiesContent(opportunities)) return null

  const title = opportunities?.title?.trim()
  const description = opportunities?.description?.trim()
  const items = (opportunities?.items ?? []).filter(hasText)

  return (
    <section
      id="oportunidades"
      className="relative w-full overflow-hidden bg-transparent px-6 pb-20 pt-2 text-white sm:pb-24 lg:px-8"
    >
      <div className="relative mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_60px_-40px_rgba(2,12,31,0.9)] ring-1 ring-white/[0.05] backdrop-blur-sm sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="mb-4 flex items-center gap-4">
                <span className="h-px w-9 bg-sky-300/45" aria-hidden="true" />
                <p className="text-xs font-bold uppercase tracking-[0.34em] text-sky-200">Oportunidades</p>
              </div>

              {title ? (
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h2>
              ) : null}

              {description ? (
                <p className="mt-4 text-sm leading-7 text-sky-100/80 sm:text-base">{description}</p>
              ) : null}
            </div>

            {items.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm text-sky-50/90 transition duration-300 hover:-translate-y-0.5 hover:border-sky-200/25 hover:bg-white/[0.08]"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-300/15 text-sky-100">
                      <CheckIcon />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
