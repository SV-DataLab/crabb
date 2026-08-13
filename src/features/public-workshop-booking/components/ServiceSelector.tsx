import type { PublicWorkshopService } from '../../../types/publicWorkshopBooking'

type ServiceSelectorProps = {
  services: PublicWorkshopService[]
  loading: boolean
  selectedServiceId: string | null
  onSelect: (serviceId: string) => void
}

export function ServiceSelector({ services, loading, selectedServiceId, onSelect }: ServiceSelectorProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:p-6">
      <h2 className="text-base font-semibold text-slate-900">¿Qué servicio necesitás?</h2>

      {loading ? (
        <div className="mt-3 flex flex-wrap gap-2" aria-live="polite">
          <div className="h-10 w-28 animate-pulse rounded-full bg-slate-100" />
          <div className="h-10 w-32 animate-pulse rounded-full bg-slate-100" />
          <div className="h-10 w-24 animate-pulse rounded-full bg-slate-100" />
        </div>
      ) : services.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">
          Todavía no hay servicios disponibles para este taller.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {services.map((service) => {
            const isSelected = service.id === selectedServiceId
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => onSelect(service.id)}
                aria-pressed={isSelected}
                className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                  isSelected
                    ? 'border-sky-600 bg-sky-50 text-sky-800'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}>
                {service.nombre}
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
