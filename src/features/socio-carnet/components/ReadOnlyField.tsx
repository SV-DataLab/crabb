type ReadOnlyFieldProps = {
  label: string
  value: string
}

export function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value || '—'}</dd>
    </div>
  )
}
