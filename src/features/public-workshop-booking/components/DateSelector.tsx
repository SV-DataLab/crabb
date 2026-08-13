type DateSelectorProps = {
  value: string
  onChange: (value: string) => void
  minDate?: string
}

export function DateSelector({ value, onChange, minDate }: DateSelectorProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:p-6">
      <label htmlFor="turno-fecha" className="text-base font-semibold text-slate-900">
        Elegí una fecha
      </label>
      <input
        id="turno-fecha"
        type="date"
        value={value}
        min={minDate}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 h-11 w-full max-w-xs rounded-lg border border-slate-300 px-3 text-sm text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
      />
    </section>
  )
}
