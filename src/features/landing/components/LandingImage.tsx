import { useState, type ReactNode } from 'react'

type Props = {
  src: string
  alt: string
  className?: string
  fallback?: ReactNode
}

function DefaultFallback({ alt }: { alt: string }) {
  return (
    <div
      className="flex h-full min-h-[220px] w-full items-center justify-center rounded-2xl border border-sky-300/20 bg-gradient-to-br from-[#0c2d52]/80 via-[#0a2445]/70 to-[#061a33]/90 p-8 text-center"
      role="img"
      aria-label={alt}
    >
      <div>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-300/25 bg-sky-400/10 text-sky-200">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
            <path
              d="M4 16l4-5 4 3 4-6 4 8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </div>
        <p className="text-sm font-medium text-sky-100/90">Imagen institucional CRABB</p>
      </div>
    </div>
  )
}

export function LandingImage({ src, alt, className = '', fallback }: Props) {
  const [failed, setFailed] = useState(false)
  const trimmed = src.trim()

  if (!trimmed || failed) {
    if (fallback === null) return null
    return <>{fallback ?? <DefaultFallback alt={alt} />}</>
  }

  return (
    <img
      src={trimmed}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
