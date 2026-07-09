import { ApiError, apiRequest } from '../lib/apiClient'
import type {
  SocioOnboardingPayload,
  SocioOnboardingResult,
  SocioOnboardingStatus,
} from '../types/socioOnboarding'

const ONBOARDING_ENDPOINT = '/public/socios/onboarding'

const RATE_LIMIT_MESSAGE =
  'Se realizaron demasiados intentos. Probá nuevamente en unos minutos.'

const GENERIC_ERROR =
  'No se pudo procesar la solicitud. Intentá nuevamente o contactá a CRABB.'

const KNOWN_STATUSES: SocioOnboardingStatus[] = [
  'activated',
  'pending',
  'account_exists',
  'request_exists',
  'identity_mismatch',
  'missing_solicitud_data',
]

export class SocioOnboardingError extends Error {
  httpStatus: number
  kind: 'validation' | 'rate_limit' | 'unknown'
  validationErrors?: Record<string, string[]>

  constructor(
    message: string,
    httpStatus: number,
    options?: {
      kind?: 'validation' | 'rate_limit' | 'unknown'
      validationErrors?: Record<string, string[]>
    },
  ) {
    super(message)
    this.name = 'SocioOnboardingError'
    this.httpStatus = httpStatus
    this.kind = options?.kind ?? 'unknown'
    this.validationErrors = options?.validationErrors
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function firstDefined<T>(...values: T[]): T | undefined {
  return values.find((value) => value !== undefined)
}

function isOnboardingStatus(value: unknown): value is SocioOnboardingStatus {
  return typeof value === 'string' && KNOWN_STATUSES.includes(value as SocioOnboardingStatus)
}

function unwrapData(body: unknown): unknown {
  if (!isRecord(body)) return body
  if ('data' in body && body.data !== undefined) return body.data
  return body
}

function extractStatus(body: unknown): SocioOnboardingStatus | null {
  if (!isRecord(body)) return null

  const direct = firstDefined(body.status, isRecord(body.data) ? body.data.status : undefined)
  if (isOnboardingStatus(direct)) return direct

  if (typeof body.code === 'string' && isOnboardingStatus(body.code)) {
    return body.code
  }

  return null
}

function parseBusinessResult(body: unknown): SocioOnboardingResult | null {
  const status = extractStatus(body)
  if (!status) return null

  const candidate = unwrapData(body)
  if (!isRecord(candidate)) {
    return { status, message: typeof body === 'object' && body && 'message' in body && typeof (body as Record<string, unknown>).message === 'string' ? (body as Record<string, unknown>).message as string : undefined }
  }

  const token =
    typeof candidate.token === 'string'
      ? candidate.token
      : typeof candidate.access_token === 'string'
        ? candidate.access_token
        : undefined

  const message = typeof candidate.message === 'string' ? candidate.message : undefined
  const user = firstDefined(candidate.user, isRecord(candidate.data) ? candidate.data.user : undefined)

  return {
    status,
    message,
    token,
    access_token: typeof candidate.access_token === 'string' ? candidate.access_token : undefined,
    user,
  }
}

function mapTransportError(error: unknown): never {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      throw new SocioOnboardingError(RATE_LIMIT_MESSAGE, error.status, { kind: 'rate_limit' })
    }

    if (error.status === 422) {
      throw new SocioOnboardingError(error.message || 'Revisá los datos ingresados.', error.status, {
        kind: 'validation',
        validationErrors: error.validationErrors,
      })
    }

    throw new SocioOnboardingError(error.message || GENERIC_ERROR, error.status)
  }

  if (error instanceof Error) {
    throw new SocioOnboardingError(error.message, 0)
  }

  throw new SocioOnboardingError(GENERIC_ERROR, 0)
}

export const socioOnboardingService = {
  async submit(payload: SocioOnboardingPayload): Promise<SocioOnboardingResult> {
    try {
      const response = await apiRequest<unknown>(ONBOARDING_ENDPOINT, {
        method: 'POST',
        body: {
          ...payload,
          device_name: payload.device_name ?? 'web',
        },
        skipAuth: true,
      })

      const result = parseBusinessResult(response)
      if (result) return result

      throw new SocioOnboardingError(GENERIC_ERROR, 0)
    } catch (error) {
      if (error instanceof SocioOnboardingError) throw error

      if (error instanceof ApiError) {
        const businessResult = parseBusinessResult(error.responseBody)
        if (businessResult) return businessResult
      }

      mapTransportError(error)
    }
  },
}
