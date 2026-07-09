import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { useAuth } from '../../hooks/useAuth'
import { hasLinkedSocio } from '../../utils/socioAccess'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  )
}

export function SocioDashboard() {
  const { user } = useAuth()
  const socio = user?.socio
  const linked = hasLinkedSocio(user)

  const displayName = socio?.denominacionTaller || socio?.nombreApellido || user?.name || 'Socio CRABB'

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md md:p-6">
        <p className="text-xs uppercase tracking-wide text-slate-400">Panel de socio</p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900 md:text-2xl">Hola, {displayName}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Desde acá podés consultar tu carnet, actualizar tus datos y buscar colegas del padrón CRABB.
        </p>
      </header>

      {!linked ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Tu cuenta no está vinculada a un socio. Contactá a CRABB para activar tu carnet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/mi-carnet"
            className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm transition hover:border-sky-300 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-sky-950">Ver mi carnet</h2>
            <p className="mt-2 text-sm text-sky-900/80">
              Mostrá tu carnet digital y el código QR de verificación.
            </p>
          </Link>
          <Link
            to="/mi-perfil"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-emerald-950">Actualizar mis datos</h2>
            <p className="mt-2 text-sm text-emerald-900/80">
              Editá celular, emails, dirección y taller/comercio.
            </p>
          </Link>
        </div>
      )}

      <Card className="border-slate-200 shadow-md" title="Tu información">
        {socio ? (
          <dl className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="Nombre" value={socio.nombreApellido || '—'} />
            <InfoRow label="Taller" value={socio.denominacionTaller || '—'} />
            <InfoRow label="Nº de socio" value={socio.nroSocio || '—'} />
            <InfoRow label="Rubro" value={socio.rubro || '—'} />
            <InfoRow label="Estado" value={socio.estado || '—'} />
          </dl>
        ) : (
          <p className="text-sm text-slate-600">
            No encontramos un socio vinculado a tu usuario por email.
          </p>
        )}
      </Card>

      <Card className="border-blue-100 bg-blue-50/40 shadow-md" title="Buscar colegas">
        <p className="text-sm text-slate-700">
          Consultá el directorio de socios activos para recomendar colegas por rubro, localidad o nombre.
        </p>
        <Link
          to="/colegas"
          className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-blue-700"
        >
          Ir a Buscar colegas
        </Link>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Módulos</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/institucional"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200/80 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-slate-900">Institucional</h3>
            <p className="mt-2 text-sm text-slate-600">Información institucional de CRABB.</p>
          </Link>
          <Link
            to="/data-tecnica"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200/80 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-slate-900">Data Técnica</h3>
            <p className="mt-2 text-sm text-slate-600">Recursos técnicos y consultas.</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
