import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function SocioUnlinkedAccountPage() {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-slate-800 shadow-sm">
      <h1 className="text-xl font-semibold text-amber-950">Cuenta sin socio asociado</h1>
      <p className="text-sm leading-7">
        Tu cuenta{user?.email ? ` (${user.email})` : ''} está autenticada, pero no encontramos un socio
        vinculado en el padrón de CRABB.
      </p>
      <p className="text-sm leading-7">
        Tu cuenta no está vinculada a un socio. Contactá a CRABB para activar tu carnet.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          to="/dashboard"
          className="inline-flex rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
        >
          Volver al inicio
        </Link>
        <a
          href="mailto:info@crabb.org.ar"
          className="inline-flex rounded-lg border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100"
        >
          Contactar a CRABB
        </a>
      </div>
    </div>
  )
}
