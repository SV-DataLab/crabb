import { Link } from 'react-router-dom'
import type { ActionLink } from '../../types/institutional'
import { isSafeActionUrl } from '../../lib/actionLinks'

type PublicActionLinkProps = {
  link: ActionLink
  className: string
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

export function PublicActionLink({ link, className }: PublicActionLinkProps) {
  if (!link.label || !link.url || !isSafeActionUrl(link.url)) return null

  if (isExternalUrl(link.url) || isMailto(link.url) || isTel(link.url)) {
    return (
      <a
        href={link.url}
        target={isExternalUrl(link.url) ? '_blank' : undefined}
        rel={isExternalUrl(link.url) ? 'noopener noreferrer' : undefined}
        className={className}
      >
        {link.label}
      </a>
    )
  }

  if (isAnchor(link.url)) {
    return (
      <a href={link.url} className={className}>
        {link.label}
      </a>
    )
  }

  return (
    <Link to={link.url} className={className}>
      {link.label}
    </Link>
  )
}
