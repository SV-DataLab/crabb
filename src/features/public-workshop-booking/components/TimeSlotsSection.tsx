import type { PublicWorkshopTimeSlot, TimeSlotsStatus } from '../../../types/publicWorkshopBooking'

type TimeSlotsSectionProps = {
  status: TimeSlotsStatus
  slots: PublicWorkshopTimeSlot[]
  selectedSlot: PublicWorkshopTimeSlot | null
  onSelect: (slot: PublicWorkshopTimeSlot) => void
}

export function TimeSlotsSection({ status, slots, selectedSlot, onSelect }: TimeSlotsSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:p-6">
      <h2 className="text-base font-semibold text-slate-900">Horarios disponibles</h2>

      <div className="mt-3">
        {status === 'idle' ? (
          <p className="text-sm text-slate-500">
            Seleccioná una fecha para consultar los horarios disponibles.
          </p>
        ) : status === 'loading' ? (
          <div className="flex flex-wrap gap-2" aria-live="polite">
            <div className="h-11 w-20 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-11 w-20 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-11 w-20 animate-pulse rounded-lg bg-slate-100" />
          </div>
        ) : status === 'error' ? (
          <p className="text-sm text-red-700">
            No pudimos consultar la disponibilidad. Probá de nuevo en unos minutos.
          </p>
        ) : status === 'empty' ? (
          <p className="text-sm text-slate-500">No hay horarios disponibles para esta fecha.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => {
              const isSelected = slot.start === selectedSlot?.start
              return (
                <button
                  key={slot.start}
                  type="button"
                  onClick={() => onSelect(slot)}
                  aria-pressed={isSelected}
                  className={`min-h-11 min-w-20 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50 text-sky-800'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}>
                  {slot.start}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
