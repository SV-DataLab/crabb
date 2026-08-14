import type { ReactNode } from 'react'
import { PublicFooter } from './PublicFooter'
import { PublicHeader } from './PublicHeader'
import { institutionalPreviewContent } from '../../features/institutional/institutionalPreviewData'

const TRAINING_EXTERNAL_URL = 'https://faatra.org.ar/capacitaciones/snit'

const publicNavItems = [
  { label: 'Inicio', href: '/' },
  { label: 'Institucional', href: '/institucional' },
  { label: 'Servicios', href: '/#servicios' },
  { label: 'Capacitaciones', href: TRAINING_EXTERNAL_URL },
  { label: 'Data Técnica', href: '/data-tecnica' },
  { label: 'Contacto', href: '/#contacto' },
]

type LegalPageLayoutProps = {
  children: ReactNode
}

export function LegalPageLayout({ children }: LegalPageLayoutProps) {
  const { footer, contact, social_links: socialLinks } = institutionalPreviewContent

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#06111f] text-white">
      <PublicHeader navItems={publicNavItems} />

      <div className="relative isolate overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(56,189,248,0.08),transparent_65%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-3xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          {children}
        </div>
      </div>

      <PublicFooter
        footer={footer}
        contact={contact}
        socialLinks={socialLinks}
        navItems={publicNavItems}
      />
    </main>
  )
}
