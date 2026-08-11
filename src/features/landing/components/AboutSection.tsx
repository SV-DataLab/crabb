import type { LandingAbout } from '../../../types/institutional'
import { LANDING_IMAGES } from '../constants'
import { LandingImage } from './LandingImage'
import { LandingReveal } from './LandingReveal'

const ABOUT_FALLBACK: LandingAbout = {
  eyebrow: 'Nosotros',
  title: 'Sobre CRABB',
  description: 'Una institución regional que representa, acompaña y fortalece al sector automotor.',
  body: 'CRABB trabaja junto a talleres, comercios y profesionales vinculados al rubro automotor, promoviendo la capacitación, la información técnica, la gestión institucional y la vinculación entre socios de Bahía Blanca y la región.',
  image_url: '',
  image_alt: 'Institucional CRABB — sector automotor regional',
  visible: true,
}

type AboutSectionProps = {
  about?: LandingAbout
}

export function AboutSection({ about }: AboutSectionProps) {
  if (about?.visible === false) return null

  const eyebrow = about?.eyebrow?.trim() || ABOUT_FALLBACK.eyebrow
  const title = about?.title?.trim() || ABOUT_FALLBACK.title
  const description = about?.description?.trim() || ABOUT_FALLBACK.description
  const body = about?.body?.trim() || ABOUT_FALLBACK.body
  const imageUrl = about?.image_url?.trim() || LANDING_IMAGES.aboutCrabb
  const imageAlt = about?.image_alt?.trim() || ABOUT_FALLBACK.image_alt || 'Institucional CRABB'

  return (
    <section id="sobre-nosotros" className="relative w-full px-6 pb-20 pt-4 sm:pb-24 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <LandingReveal>
          <article className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.04] shadow-[0_24px_60px_-40px_rgba(2,12,31,0.9)] ring-1 ring-white/[0.05] backdrop-blur-sm">
            <div className="grid lg:grid-cols-2">
              <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-200/90">{eyebrow}</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h2>
                <p className="mt-4 text-base font-medium leading-relaxed text-sky-100/92">{description}</p>
                <p className="mt-4 text-sm leading-7 text-sky-100/78 sm:text-base">{body}</p>
              </div>

              <div className="border-t border-white/10 lg:border-l lg:border-t-0">
                <LandingImage
                  src={imageUrl}
                  alt={imageAlt}
                  className="h-full min-h-[240px] w-full object-cover object-center lg:min-h-full"
                />
              </div>
            </div>
          </article>
        </LandingReveal>
      </div>
    </section>
  )
}
