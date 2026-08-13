import type { PublicWorkshop, WorkshopStatus } from '../../../types/publicWorkshopBooking'

type WorkshopHeaderCardProps = {
  workshop: PublicWorkshop | null
  status: WorkshopStatus
  onRetry?: () => void
}

export function WorkshopHeaderCard({ workshop, status, onRetry }: WorkshopHeaderCardProps) {
  if (status === 'not-found') {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:p-6">
        <p className="text-sm font-medium text-slate-900">Taller no encontrado</p>
        <p className="mt-1 text-sm text-slate-600">
          El enlace que abriste no corresponde a ningún taller activo.
        </p>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm md:p-6">
        <p className="text-sm font-medium text-red-900">Error temporal de conexión</p>
        <p className="mt-1 text-sm text-red-800">
          No pudimos comunicarnos con TallerOK. Probá de nuevo en unos minutos.
        </p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 min-h-11 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-100">
            Reintentar
          </button>
        ) : null}
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
          {status === 'found' && workshop?.logoUrl ? (
            <img
              src={workshop.logoUrl}
              alt={workshop.nombre}
              className="h-14 w-14 rounded-xl object-cover"
            />
          ) : (
            <span className="text-xs font-medium uppercase">Logo</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          {status === 'loading' ? (
            <div className="space-y-2" aria-live="polite">
              <p className="text-sm text-slate-500">Cargando datos del taller…</p>
              <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />
            </div>
          ) : workshop ? (
            <>
              <h2 className="truncate text-lg font-semibold text-slate-900">{workshop.nombre}</h2>
              {workshop.rubro ? <p className="truncate text-sm text-slate-600">{workshop.rubro}</p> : null}
              {workshop.direccion ? (
                <p className="truncate text-sm text-slate-600">{workshop.direccion}</p>
              ) : null}
              {workshop.telefono ? (
                <p className="truncate text-sm text-slate-600">{workshop.telefono}</p>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}
