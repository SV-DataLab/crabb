import { Link } from 'react-router-dom'
import type { ActionLink } from '../../types/institutional'
import { isSafeActionUrl } from '../../lib/actionLinks'

type PublicActionLinkProps = {
  link: ActionLink
  className: string
  /** Aviso corto (ej. "Requiere ingreso") mostrado como badge inline y anexado al nombre accesible. */
  badge?: string
}

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

function isAnchor(url: string): boolean {
  return url.startsWith('#')
}

function isMailto(url: string): boolean {
  return /^mailto:/i.test(url)
}

function isTel(url: string): boolean {
  return /^tel:/i.test(url)
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" aria-hidden="true">
      <rect x="4.5" y="8.5" width="11" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.75 8.5V6a3.25 3.25 0 0 1 6.5 0v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function ActionLinkContent({ label, badge }: { label: string; badge?: string }) {
  if (!badge) return <>{label}</>

  return (
    <>
      <span>{label}</span>
      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-black/15 px-2 py-0.5 text-[0.65rem] font-semibold normal-case tracking-normal opacity-90">
        <LockIcon />
        {badge}
      </span>
    </>
  )
}

export function PublicActionLink({ link, className, badge }: PublicActionLinkProps) {
  if (!link.label || !link.url || !isSafeActionUrl(link.url)) return null

  const accessibleLabel = badge ? `${link.label} (${badge})` : undefined

  if (isExternalUrl(link.url) || isMailto(link.url) || isTel(link.url)) {
    return (
      <a
        href={link.url}
        target={isExternalUrl(link.url) ? '_blank' : undefined}
        rel={isExternalUrl(link.url) ? 'noopener noreferrer' : undefined}
        className={className}
        aria-label={accessibleLabel}
      >
        <ActionLinkContent label={link.label} badge={badge} />
      </a>
    )
  }

  if (isAnchor(link.url)) {
    return (
      <a href={link.url} className={className} aria-label={accessibleLabel}>
        <ActionLinkContent label={link.label} badge={badge} />
      </a>
    )
  }

  return (
    <Link to={link.url} className={className} aria-label={accessibleLabel}>
      <ActionLinkContent label={link.label} badge={badge} />
    </Link>
  )
}
