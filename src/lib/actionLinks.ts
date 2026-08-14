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

/**
 * Rutas que existen en el router pero están anidadas bajo ProtectedRoute
 * (requieren sesión iniciada). Se usan solo para mostrar un aviso visual
 * ("Requiere ingreso") junto a los links públicos que apuntan ahí — no
 * cambian el comportamiento de las rutas ni de los guards.
 */
type SocialLinkLike = {
  platform: string
  url: string
  order?: number
  visible?: boolean
}

/** Redes visibles, ordenadas, y garantizadas con URL segura (nunca placeholders vacíos o "#"). */
export function resolveVisibleSocialLinks<T extends SocialLinkLike>(links: T[]): T[] {
  return links
    .filter((link) => link.platform?.trim() && isSafeActionUrl(link.url ?? ''))
    .filter((link) => link.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export function isProtectedInternalPath(url: string): boolean {
  const trimmed = url.trim().toLowerCase()
  if (!trimmed) return false
  return (
    trimmed === '/institucional' ||
    trimmed.startsWith('/institucional/') ||
    trimmed.startsWith('/institucional?') ||
    trimmed === '/data-tecnica' ||
    trimmed.startsWith('/data-tecnica/') ||
    trimmed.startsWith('/data-tecnica?')
  )
}
