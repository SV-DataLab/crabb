function isAnchor(url: string): boolean {
  return url.startsWith('#')
}

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

function isMailto(url: string): boolean {
  return /^mailto:/i.test(url)
}

function isTel(url: string): boolean {
  return /^tel:/i.test(url)
}

/** Reject dangerous protocols (javascript:, data:, etc.); accept anchors, internal paths, http(s), mailto and tel. */
export function isSafeActionUrl(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return false
  if (isAnchor(trimmed)) return true
  // Reject protocol-relative URLs (`//evil.example`) which browsers treat as http(s).
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true
  if (isExternalUrl(trimmed)) return true
  if (isMailto(trimmed)) return true
  if (isTel(trimmed)) return true
  return false
}

/** Public CMS links cannot point to admin, login, or other reserved app surfaces. */
export function isForbiddenPublicPath(url: string): boolean {
  const trimmed = url.trim().toLowerCase()
  if (!trimmed) return false
  if (trimmed === '/login' || trimmed.startsWith('/login/') || trimmed.startsWith('/login?')) return true
  if (trimmed === '/admin' || trimmed.startsWith('/admin/') || trimmed.includes('/admin')) return true
  return false
}

export function isPublicCmsUrl(url: string): boolean {
  return isSafeActionUrl(url) && !isForbiddenPublicPath(url)
}
