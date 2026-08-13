const DEFAULT_API_BASE_URL = 'https://api.crabbahia.com.ar/api'
const DEFAULT_TALLEROK_API_URL = 'https://tallerok-api.crabbahia.com.ar/api'

function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
}

function readOptionalEnv(value: string | undefined): string | undefined {
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

function normalizeEndpoint(value: string | undefined, fallback: string): string {
  const endpoint = readOptionalEnv(value) ?? fallback
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const apiBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL)
const tallerokApiUrl = normalizeBaseUrl(
  import.meta.env.VITE_TALLEROK_API_URL ?? DEFAULT_TALLEROK_API_URL,
)

export const env = {
  apiBaseUrl,
  tallerokApiUrl,
  authLoginEndpoint: normalizeEndpoint(import.meta.env.VITE_AUTH_LOGIN_ENDPOINT, '/auth/login'),
  authMeEndpoint: normalizeEndpoint(import.meta.env.VITE_AUTH_ME_ENDPOINT, '/auth/me'),
  authLogoutEndpoint: normalizeEndpoint(import.meta.env.VITE_AUTH_LOGOUT_ENDPOINT, '/auth/logout'),
  colegasSearchEndpoint: readOptionalEnv(import.meta.env.VITE_COLEGAS_SEARCH_ENDPOINT),
}

if (import.meta.env.DEV) {
  console.log('[ENV][AUTH] baseUrl configurada', { apiBaseUrl: env.apiBaseUrl })
  console.log('[ENV][AUTH] endpoints configurados', {
    login: env.authLoginEndpoint,
    me: env.authMeEndpoint,
    logout: env.authLogoutEndpoint,
  })
}

export function ensureEnv(): void {
  if (!env.apiBaseUrl) {
    throw new Error('Falta VITE_API_BASE_URL en variables de entorno y no se pudo aplicar default.')
  }

  if (!isValidHttpUrl(env.apiBaseUrl)) {
    throw new Error(`VITE_API_BASE_URL inválida: ${env.apiBaseUrl}`)
  }
}
