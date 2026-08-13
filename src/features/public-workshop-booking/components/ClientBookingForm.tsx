import type { PublicWorkshopClientFormData } from '../../../types/publicWorkshopBooking'

type ClientBookingFormProps = {
  value: PublicWorkshopClientFormData
  onChange: (value: PublicWorkshopClientFormData) => void
  onSubmit: () => void
  canSubmit: boolean
}

const inputClass =
  'mt-1 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600'

const labelClass = 'text-sm font-medium text-slate-700'

export function ClientBookingForm({ value, onChange, onSubmit, canSubmit }: ClientBookingFormProps) {
  function setField<K extends keyof PublicWorkshopClientFormData>(field: K, fieldValue: string) {
    onChange({ ...value, [field]: fieldValue })
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:p-6">
      <h2 className="text-base font-semibold text-slate-900">Tus datos</h2>

      <form
        className="mt-3 grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}>
        <label className="sm:col-span-2">
          <span className={labelClass}>Nombre y apellido</span>
          <input
            className={inputClass}
            value={value.nombreApellido}
            onChange={(event) => setField('nombreApellido', event.target.value)}
            autoComplete="name"
          />
        </label>

        <label>
          <span className={labelClass}>Teléfono o WhatsApp</span>
          <input
            className={inputClass}
            value={value.telefono}
            onChange={(event) => setField('telefono', event.target.value)}
            type="tel"
            autoComplete="tel"
          />
        </label>

        <label>
          <span className={labelClass}>Correo electrónico</span>
          <input
            className={inputClass}
            value={value.email}
            onChange={(event) => setField('email', event.target.value)}
            type="email"
            autoComplete="email"
          />
        </label>

        <label>
          <span className={labelClass}>Patente</span>
          <input
            className={inputClass}
            value={value.patente}
            onChange={(event) => setField('patente', event.target.value.toUpperCase())}
          />
        </label>

        <label>
          <span className={labelClass}>Marca y modelo</span>
          <input
            className={inputClass}
            value={value.marcaModelo}
            onChange={(event) => setField('marcaModelo', event.target.value)}
          />
        </label>

        <label className="sm:col-span-2">
          <span className={labelClass}>Motivo de la consulta</span>
          <input
            className={inputClass}
            value={value.motivo}
            onChange={(event) => setField('motivo', event.target.value)}
          />
        </label>

        <label className="sm:col-span-2">
          <span className={labelClass}>Comentarios</span>
          <textarea
            className={`${inputClass} h-24 resize-none py-2`}
            value={value.comentarios}
            onChange={(event) => setField('comentarios', event.target.value)}
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="min-h-11 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300 sm:col-span-2">
          Solicitar turno
        </button>
      </form>
    </section>
  )
}
