type CarnetPhotoProps = {
  fotoUrl?: string | null
  nombreApellido?: string | null
  size?: 'sm' | 'lg'
}

function initialsFrom(name?: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase() || '?'
}

export function CarnetPhoto({ fotoUrl, nombreApellido, size = 'lg' }: CarnetPhotoProps) {
  const dimensionClass = size === 'lg' ? 'h-24 w-24 text-2xl' : 'h-16 w-16 text-lg'

  if (fotoUrl) {
    return (
      <img
        src={fotoUrl}
        alt={nombreApellido ? `Foto de ${nombreApellido}` : 'Foto del socio'}
        className={`${dimensionClass} shrink-0 rounded-full border border-slate-200 object-cover shadow-sm`}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={nombreApellido ? `Sin foto cargada para ${nombreApellido}` : 'Sin foto cargada'}
      className={`${dimensionClass} flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 font-semibold text-slate-500 shadow-sm`}
    >
      {initialsFrom(nombreApellido)}
    </div>
  )
}
