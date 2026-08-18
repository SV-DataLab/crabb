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
      className="relative flex h-full min-h-[220px] w-full items-center justify-center overflow-hidden rounded-2xl border border-sky-300/20 bg-gradient-to-br from-[#0c2d52] via-[#0a2445] to-[#061a33]"
      role="img"
      aria-label={alt}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.22),transparent_45%),radial-gradient(circle_at_82%_78%,rgba(96,165,250,0.18),transparent_42%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(148,163,184,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.5)_1px,transparent_1px)] [background-size:32px_32px]"
        aria-hidden="true"
      />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-300/25 bg-sky-400/10 text-sky-200 backdrop-blur-sm">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
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
