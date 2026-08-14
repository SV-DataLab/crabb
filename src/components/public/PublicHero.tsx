import { useEffect, useState } from 'react'
import type { ActionLink, LandingHeroVisual } from '../../types/institutional'
import { PublicActionLink } from './PublicActionLink'

type HeroKpi = {
  label: string
  value: string
}

type PublicHeroProps = {
  badge: string
  title: string
  description: string
  primaryCta: ActionLink
  secondaryCta: ActionLink
  imageUrl: string
  fallbackImageUrl: string
  imageAlt: string
  isDefaultBlueprintImage?: boolean
  values?: string[]
  visual?: LandingHeroVisual
  kpis?: HeroKpi[]
}

const LEGACY_HERO_BADGES = ['CAMARA REGIONAL AUTOMOTOR', 'CÁMARA REGIONAL AUTOMOTOR'] as const

const LEGACY_HERO_TITLES = [
  'Cámara Regional Automotor de Bahía Blanca',
  'Camara Regional Automotor de Bahia Blanca',
] as const

const CANONICAL_HERO_BADGE = 'CÁMARA DE REPARACIÓN DE AUTOMOTORES'
const CANONICAL_HERO_TITLE = 'Cámara de Reparación de Automotores de Bahía Blanca'

const REFERENCE_TITLE_LINES = [
  'Cámara de Reparación',
  'de Automotores',
  'de Bahía Blanca',
] as const

const TITLE_LINE_ANIMATION_DELAYS = ['80ms', '160ms', '240ms', '320ms'] as const

const fallbackHeroContent = {
  badge: CANONICAL_HERO_BADGE,
  description:
    'Representamos, acompañamos y fortalecemos al sector automotor regional, promoviendo la profesionalización, la innovación y el desarrollo sostenible de talleres, comercios y profesionales vinculados al rubro.',
}

const fallbackHeroImageAlt = 'Representación del ecosistema automotor de CRABB'

function normalizeHeroText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function isLegacyHeroBadge(value: string): boolean {
  const normalized = normalizeHeroText(value)
  return LEGACY_HERO_BADGES.some((legacy) => normalizeHeroText(legacy) === normalized)
}

function isLegacyHeroTitle(value: string): boolean {
  const normalized = normalizeHeroText(value)
  return LEGACY_HERO_TITLES.some((legacy) => normalizeHeroText(legacy) === normalized)
}

function resolveHeroBadge(badge: string): string {
  const trimmed = badge.trim()
  if (!trimmed || isLegacyHeroBadge(trimmed)) {
    return CANONICAL_HERO_BADGE
  }

  return trimmed
}

function isHighlightedTitleLine(line: string, index: number, useReferenceTitle: boolean): boolean {
  if (useReferenceTitle) {
    return index === 2
  }

  return normalizeHeroText(line).includes('bahia blanca')
}

export function PublicHero({
  badge,
  title,
  description,
  primaryCta,
  secondaryCta,
  imageUrl,
  fallbackImageUrl,
  imageAlt,
  isDefaultBlueprintImage = false,
}: PublicHeroProps) {
  const [displayedImageUrl, setDisplayedImageUrl] = useState(imageUrl)
  const [imageFailed, setImageFailed] = useState(false)
  const resolvedImageAlt = imageAlt.trim() || fallbackHeroImageAlt
  const showHeroImage = !imageFailed && displayedImageUrl.trim().length > 0
  const isBlueprintMode =
    isDefaultBlueprintImage || displayedImageUrl === fallbackImageUrl

  useEffect(() => {
    setDisplayedImageUrl(imageUrl)
    setImageFailed(false)
  }, [imageUrl])

  const handleImageError = () => {
    if (displayedImageUrl !== fallbackImageUrl) {
      setDisplayedImageUrl(fallbackImageUrl)
      return
    }

    setImageFailed(true)
  }

  const resolvedBadge = resolveHeroBadge(badge)
  const normalizedTitle = normalizeHeroText(title)

  const useReferenceTitle =
    normalizedTitle.length === 0 || normalizedTitle === 'crabb' || isLegacyHeroTitle(title)

  const titleLines = useReferenceTitle
    ? [...REFERENCE_TITLE_LINES]
    : title
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

  const primaryLink: ActionLink = {
    ...primaryCta,
    label: primaryCta.label || 'Conocer servicios',
    url: primaryCta.url || '#servicios',
  }

  const secondaryLink: ActionLink = {
    ...secondaryCta,
    label: secondaryCta.label || 'Contacto institucional',
    url: secondaryCta.url || '#contacto',
  }

  return (
    <section
      id="inicio"
      className="relative z-10 min-h-[min(720px,92vh)] w-full overflow-x-clip overflow-y-visible bg-transparent text-white"
    >
      <div className="relative mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:min-h-[min(680px,88vh)] lg:px-8 lg:py-20">
        <div className="grid items-center gap-7 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-10 xl:gap-14">
          <p className="hero-animate-badge order-1 inline-flex w-fit rounded-full border border-sky-300/40 bg-sky-300/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100 backdrop-blur-sm lg:col-start-1 lg:row-start-1">
            {resolvedBadge || fallbackHeroContent.badge}
          </p>

          <h1 className="order-2 mt-0 text-balance text-[2rem] font-bold leading-[1.05] text-white sm:text-4xl lg:col-start-1 lg:row-start-2 lg:mt-2 lg:text-[3.75rem] lg:leading-[1.02] xl:text-[4.25rem]">
            {titleLines.length > 0 ? (
              titleLines.map((line, index) => (
                <span
                  key={`${line}-${index}`}
                  className={`hero-animate-title block ${
                    isHighlightedTitleLine(line, index, useReferenceTitle)
                      ? 'text-sky-300 [text-shadow:0_0_32px_rgba(56,189,248,0.4)]'
                      : ''
                  }`}
                  style={{ animationDelay: TITLE_LINE_ANIMATION_DELAYS[index] ?? '240ms' }}
                >
                  {line}
                </span>
              ))
            ) : (
              <span className="hero-animate-title block text-white" style={{ animationDelay: '80ms' }}>
                {CANONICAL_HERO_TITLE}
              </span>
            )}
          </h1>

          <p className="hero-animate-description order-3 max-w-lg text-base leading-relaxed text-slate-300/95 sm:text-lg lg:col-start-1 lg:row-start-3">
            {description || fallbackHeroContent.description}
          </p>

          {showHeroImage ? (
            <div
              className={`order-4 w-full min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-4 lg:self-center ${
                isBlueprintMode
                  ? 'relative mx-auto overflow-visible lg:mx-0'
                  : 'relative mx-auto max-w-[min(100%,560px)] lg:mx-0 lg:max-w-none lg:justify-self-end'
              }`}
            >
              {isBlueprintMode ? (
                <div className="hero-animate-image-blueprint relative overflow-visible">
                  <div className="relative flex items-center justify-center overflow-visible lg:justify-end">
                    <div
                      className="pointer-events-none absolute left-1/2 top-1/2 h-[min(420px,72vw)] w-[min(420px,72vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/8 blur-3xl lg:left-[58%] lg:h-[min(520px,58vh)] lg:w-[min(520px,58vh)]"
                      aria-hidden="true"
                    />

                    <div className="relative z-10 origin-center lg:translate-x-2 lg:scale-[1.18]">
                      <img
                        src={displayedImageUrl}
                        alt={resolvedImageAlt}
                        loading="eager"
                        decoding="sync"
                        className="mx-auto block h-auto w-full max-w-full object-contain max-h-[300px] sm:max-h-[380px] md:max-h-[440px] lg:ml-auto lg:mr-0 lg:max-h-[min(680px,78vh)]"
                        onError={handleImageError}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hero-animate-image-admin overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-2xl shadow-black/30">
                  <img
                    src={displayedImageUrl}
                    alt={resolvedImageAlt}
                    loading="eager"
                    decoding="async"
                    className="mx-auto h-auto w-full max-h-[280px] object-cover object-center sm:max-h-[360px] lg:max-h-[min(520px,70vh)]"
                    onError={handleImageError}
                  />
                </div>
              )}
            </div>
          ) : null}

          <div className="order-5 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4 lg:col-start-1 lg:row-start-4">
            <PublicActionLink
              link={primaryLink}
              className="hero-animate-cta-primary inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-sky-300 to-sky-400 px-7 py-4 text-sm font-bold uppercase tracking-[0.08em] text-[#06213c] shadow-[0_12px_40px_rgba(56,189,248,0.25)] transition hover:brightness-110 sm:w-auto"
            />

            <PublicActionLink
              link={secondaryLink}
              className="hero-animate-cta-secondary inline-flex w-full items-center justify-center rounded-full border border-white/25 bg-white/5 px-7 py-4 text-sm font-bold uppercase tracking-[0.08em] text-white backdrop-blur-sm transition hover:border-sky-300/50 hover:bg-white/8 sm:w-auto"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
