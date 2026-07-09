import { env } from '../config/env'
import { apiRequest } from '../lib/apiClient'
import type { AuthUser, LinkedSocio, LoginPayload } from '../types/auth'

export type { AuthUser, LinkedSocio, LoginPayload, UserRole } from '../types/auth'

type LoginResponse = {
  token?: string
  access_token?: string
  user?: unknown
  data?: {
    user?: unknown
  }
}

type MeResponse =
  | {
      user?: unknown
      data?: {
        user?: unknown
      }
    }
  | unknown

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toStringOrEmpty(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

function extractUserCandidate(value: unknown): unknown {
  if (!isRecord(value)) return value
  if ('user' in value && value.user !== undefined) return value.user
  if (isRecord(value.data) && 'user' in value.data && value.data.user !== undefined) return value.data.user
  return value
}

function normalizeLinkedSocio(raw: unknown): LinkedSocio | null {
  if (!isRecord(raw)) return null

  const id = raw.id
  if (typeof id !== 'string' && typeof id !== 'number') return null

  return {
    id,
    nroSocio: toStringOrEmpty(firstDefined(raw.nroSocio, raw.nro_socio)),
    nombreApellido: toStringOrEmpty(firstDefined(raw.nombreApellido, raw.nombre_apellido)),
    denominacionTaller:
      toStringOrEmpty(firstDefined(raw.denominacionTaller, raw.denominacion_taller)) || null,
    rubro: toStringOrEmpty(raw.rubro) || null,
    categoria: toStringOrEmpty(raw.categoria) || null,
    condicion: toStringOrEmpty(raw.condicion) || null,
    estado: toStringOrEmpty(raw.estado) || null,
    dniCuit: toStringOrEmpty(firstDefined(raw.dniCuit, raw.dni_cuit)) || null,
    emails: toStringOrEmpty(raw.emails) || null,
    celular: toStringOrEmpty(raw.celular) || null,
  }
}

function firstDefined<T>(...values: T[]): T | undefined {
  return values.find((value) => value !== undefined)
}

export function normalizeUser(raw: unknown): AuthUser | null {
  const candidate = extractUserCandidate(raw)
  if (!isRecord(candidate)) return null

  const id = candidate.id
  if (typeof id !== 'string' && typeof id !== 'number') return null

  const name = toStringOrEmpty(candidate.name)
  const email = toStringOrEmpty(candidate.email)
  const roleRaw = toStringOrEmpty(candidate.role).trim().toLowerCase()
  const socio = normalizeLinkedSocio(candidate.socio)
  const socioIdRaw = firstDefined(candidate.socio_id, candidate.socioId, socio?.id)
  const socioId =
    typeof socioIdRaw === 'string' || typeof socioIdRaw === 'number' ? socioIdRaw : null

  return {
    id,
    name,
    email,
    role: (roleRaw || 'socio') as AuthUser['role'],
    socioId,
    socio,
  }
}

function extractToken(response: LoginResponse): string {
  const token = response.token ?? response.access_token
  if (!token) {
    throw new Error('La respuesta de login no incluye token.')
  }
  return token
}

export const authService = {
  async login(payload: LoginPayload): Promise<{ token: string; user?: AuthUser }> {
    const endpoint = env.authLoginEndpoint

    if (import.meta.env.DEV) {
      console.log('[AUTH][LOGIN][REQ]', { email: payload.email, hasPassword: Boolean(payload.password) })
    }

    const response = await apiRequest<LoginResponse>(endpoint, {
      method: 'POST',
      body: { ...payload, device_name: 'frontend-web' },
    })

    const user = normalizeUser(response)

    if (import.meta.env.DEV) {
      console.log('[AUTH][LOGIN][USER]', {
        id: user?.id ?? null,
        email: user?.email ?? null,
        role: user?.role ?? null,
      })
    }

    return {
      token: extractToken(response),
      user: user ?? undefined,
    }
  },

  async getCurrentUser(token?: string): Promise<AuthUser> {
    const endpoint = env.authMeEndpoint

    if (import.meta.env.DEV) {
      console.log('[AUTH][ME][REQ]')
    }

    const response = await apiRequest<MeResponse>(endpoint, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    const user = normalizeUser(response)

    if (!user) {
      throw new Error('La respuesta de /auth/me no incluye un usuario válido.')
    }

    if (import.meta.env.DEV) {
      console.log('[AUTH][ME][USER]', { id: user.id, email: user.email, role: user.role })
    }

    return user
  },

  async logout(): Promise<void> {
    const endpoint = env.authLogoutEndpoint

    if (import.meta.env.DEV) {
      console.log('[AUTH][LOGOUT]')
    }

    await apiRequest<void>(endpoint, { method: 'POST' })
  },
}
