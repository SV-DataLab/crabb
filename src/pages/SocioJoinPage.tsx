import { PublicFormPageLayout } from '../components/public/PublicFormPageLayout'
import { SocioOnboardingForm } from '../components/socio-registration/SocioOnboardingForm'
import { usePageMeta } from '../hooks/usePageMeta'

export function SocioJoinPage() {
  usePageMeta(
    'Asociarme / Activar cuenta | CRABB',
    'Asociate a CRABB o activá tu cuenta de socio con DNI/CUIT y email.',
  )

  return (
    <PublicFormPageLayout>
      <div className="rounded-2xl border border-white/10 bg-white p-6 shadow-2xl shadow-black/20 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
          Asociación y acceso
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Asociarme / Activar mi cuenta
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Un solo formulario para activar tu cuenta si ya sos socio o solicitar tu asociación a CRABB.
        </p>

        <div className="mt-8">
          <SocioOnboardingForm />
        </div>
      </div>
    </PublicFormPageLayout>
  )
}
