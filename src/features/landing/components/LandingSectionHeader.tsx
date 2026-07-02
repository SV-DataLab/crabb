type Props = {
  eyebrow: string
  title: string
  description?: string
  align?: 'center' | 'left'
  light?: boolean
}

export function LandingSectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
  light = false,
}: Props) {
  const isCenter = align === 'center'

  return (
    <div className={isCenter ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl'}>
      <div className={`mb-4 flex items-center gap-4 ${isCenter ? 'justify-center' : ''}`}>
        <span
          className={`h-px w-9 ${light ? 'bg-sky-300/45' : 'bg-sky-500/35'}`}
          aria-hidden="true"
        />
        <p
          className={`text-xs font-bold uppercase tracking-[0.34em] ${
            light ? 'text-sky-200' : 'text-sky-700'
          }`}
        >
          {eyebrow}
        </p>
        <span
          className={`h-px w-9 ${light ? 'bg-sky-300/45' : 'bg-sky-500/35'}`}
          aria-hidden="true"
        />
      </div>

      <h2
        className={`text-3xl font-semibold tracking-tight sm:text-4xl ${
          light ? 'text-white' : 'text-slate-900'
        }`}
      >
        {title}
      </h2>

      {description ? (
        <p
          className={`mt-4 text-sm leading-7 sm:text-base ${
            isCenter ? 'mx-auto max-w-2xl' : ''
          } ${light ? 'text-sky-100/85' : 'text-slate-600'}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}
