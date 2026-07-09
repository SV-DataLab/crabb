import { ApiError, apiRequest } from '../lib/apiClient'
import type {
  SocioAccountActivationPayload,
  SocioAccountActivationErrorKind,
  SocioAccountActivationResponse,
  SocioJoinRequestErrorKind,
  SocioJoinRequestPayload,
  SocioJoinRequestResponse,
} from '../types/socioRegistration'

const JOIN_REQUEST_ENDPOINT = '/public/socios/solicitudes'
const ACCOUNT_ACTIVATION_ENDPOINT = '/auth/register-socio'

const RATE_LIMIT_MESSAGE =
  'Se realizaron demasiados intentos. Probá nuevamente en unos minutos.'

const GENERIC_JOIN_ERROR =
  'No se pudo enviar la solicitud. Intentá nuevamente o contactá a CRABB.'

const GENERIC_ACTIVATION_ERROR =
  'No se pudo crear la cuenta. Intentá nuevamente o contactá a CRABB.'

export class SocioJoinRequestError extends Error {
  status: number
  code?: string
  kind: SocioJoinRequestErrorKind
  validationErrors?: Record<string, string[]>

  constructor(
    message: string,
    status: number,
    options?: {
      code?: string
      kind?: SocioJoinRequestErrorKind
      validationErrors?: Record<string, string[]>
    },
  ) {
    super(message)
    this.name = 'SocioJoinRequestError'
    this.status = status
    this.code = options?.code
    this.kind = options?.kind ?? 'unknown'
    this.validationErrors = options?.validationErrors
  }
}

export class SocioAccountActivationError extends Error {
  status: number
  code?: string
  kind: SocioAccountActivationErrorKind
  validationErrors?: Record<string, string[]>

  constructor(
    message: string,
    status: number,
    options?: {
      code?: string
      kind?: SocioAccountActivationErrorKind
      validationErrors?: Record<string, string[]>
    },
  ) {
    super(message)
    this.name = 'SocioAccountActivationError'
    this.status = status
    this.code = options?.code
    this.kind = options?.kind ?? 'unknown'
    this.validationErrors = options?.validationErrors
  }
}

function resolveJoinRequestErrorKind(error: ApiError): SocioJoinRequestErrorKind {
  const code = error.code?.trim()

  if (code === 'socio_already_exists') return 'socio_already_exists'
  if (code === 'solicitud_exists') return 'solicitud_exists'
  if (error.status === 422) return 'validation'
  if (error.status === 429) return 'rate_limit'

  return 'unknown'
}

function mapJoinRequestError(error: unknown): never {
  if (error instanceof ApiError) {
    const kind = resolveJoinRequestErrorKind(error)

    if (kind === 'rate_limit') {
      throw new SocioJoinRequestError(RATE_LIMIT_MESSAGE, error.status, {
        code: error.code,
        kind,
      })
    }

    if (kind === 'socio_already_exists') {
      throw new SocioJoinRequestError(
        'Ya existe un socio con ese DNI/CUIT. Podés activar tu cuenta de socio.',
        error.status,
        { code: error.code, kind },
      )
    }

    if (kind === 'solicitud_exists') {
      throw new SocioJoinRequestError(
        'Ya existe una solicitud pendiente con esos datos. La administración de CRABB la revisará.',
        error.status,
        { code: error.code, kind },
      )
    }

    if (kind === 'validation') {
      throw new SocioJoinRequestError(
        error.message || 'Revisá los datos ingresados.',
        error.status,
        { code: error.code, kind, validationErrors: error.validationErrors },
      )
    }

    throw new SocioJoinRequestError(GENERIC_JOIN_ERROR, error.status, {
      code: error.code,
      kind,
    })
  }

  if (error instanceof Error) {
    throw new SocioJoinRequestError(error.message, 0)
  }

  throw new SocioJoinRequestError(GENERIC_JOIN_ERROR, 0)
}

function resolveActivationErrorKind(error: ApiError): SocioAccountActivationErrorKind {
  const code = error.code?.trim()

  if (code === 'socio_not_found') return 'socio_not_found'
  if (code === 'email_mismatch') return 'email_mismatch'
  if (code === 'account_exists') return 'account_exists'
  if (code === 'email_already_used') return 'email_already_used'
  if (error.status === 422) return 'validation'
  if (error.status === 429) return 'rate_limit'
  if (error.status === 404) return 'socio_not_found'

  return 'unknown'
}

function mapActivationError(error: unknown): never {
  if (error instanceof ApiError) {
    const kind = resolveActivationErrorKind(error)

    if (kind === 'rate_limit') {
      throw new SocioAccountActivationError(RATE_LIMIT_MESSAGE, error.status, {
        code: error.code,
        kind,
      })
    }

    if (kind === 'socio_not_found') {
      throw new SocioAccountActivationError(
        'No encontramos un socio con esos datos. Contactá a CRABB.',
        error.status,
        { code: error.code, kind },
      )
    }

    if (kind === 'email_mismatch') {
      throw new SocioAccountActivationError(
        'El email no coincide con los datos registrados para ese socio. Revisá el correo cargado o contactá a CRABB.',
        error.status,
        { code: error.code, kind, validationErrors: error.validationErrors },
      )
    }

    if (kind === 'account_exists') {
      throw new SocioAccountActivationError(
        'Este socio ya tiene una cuenta creada. Iniciá sesión o recuperá tu contraseña.',
        error.status,
        { code: error.code, kind },
      )
    }

    if (kind === 'email_already_used') {
      throw new SocioAccountActivationError(
        'Ese email ya está asociado a otra cuenta.',
        error.status,
        { code: error.code, kind },
      )
    }

    if (kind === 'validation') {
      throw new SocioAccountActivationError(
        error.message || 'Revisá los datos ingresados.',
        error.status,
        { code: error.code, kind, validationErrors: error.validationErrors },
      )
    }

    throw new SocioAccountActivationError(GENERIC_ACTIVATION_ERROR, error.status, {
      code: error.code,
      kind,
    })
  }

  if (error instanceof Error) {
    throw new SocioAccountActivationError(error.message, 0)
  }

  throw new SocioAccountActivationError(GENERIC_ACTIVATION_ERROR, 0)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeJoinRequestResponse(body: unknown): SocioJoinRequestResponse {
  if (!isRecord(body)) return {}

  const dataRaw = body.data
  if (!isRecord(dataRaw)) {
    return { message: typeof body.message === 'string' ? body.message : undefined }
  }

  const id = dataRaw.id
  const estado = dataRaw.estado

  return {
    message: typeof body.message === 'string' ? body.message : undefined,
    data:
      (typeof id === 'string' || typeof id === 'number') && typeof estado === 'string'
        ? { id, estado }
        : undefined,
  }
}

function normalizeActivationResponse(body: unknown): SocioAccountActivationResponse {
  if (!isRecord(body)) return {}

  const dataRaw = isRecord(body.data) ? body.data : null
  const token =
    typeof body.token === 'string'
      ? body.token
      : typeof body.access_token === 'string'
        ? body.access_token
        : dataRaw && typeof dataRaw.token === 'string'
          ? dataRaw.token
          : dataRaw && typeof dataRaw.access_token === 'string'
            ? dataRaw.access_token
            : undefined

  const userRaw = firstDefined(body.user, dataRaw?.user)
  const estadoRaw = firstDefined(body.estado, dataRaw?.estado)
  const pendingApproval =
    typeof estadoRaw === 'string' && estadoRaw.trim().toLowerCase() === 'pendiente'

  let user: SocioAccountActivationResponse['user']
  if (isRecord(userRaw)) {
    const id = userRaw.id
    const role = userRaw.role
    if ((typeof id === 'string' || typeof id === 'number') && typeof role === 'string') {
      user = {
        id,
        role,
        email: typeof userRaw.email === 'string' ? userRaw.email : undefined,
        name: typeof userRaw.name === 'string' ? userRaw.name : undefined,
        socio_id: firstDefined(userRaw.socio_id, userRaw.socioId) as number | string | null | undefined,
        socio: userRaw.socio,
      }
    }
  }

  return {
    message: typeof body.message === 'string' ? body.message : undefined,
    token,
    access_token: typeof body.access_token === 'string' ? body.access_token : undefined,
    pendingApproval: pendingApproval && !token,
    user,
  }
}

function firstDefined<T>(...values: T[]): T | undefined {
  return values.find((value) => value !== undefined)
}

export const socioRegistrationService = {
  async submitJoinRequest(payload: SocioJoinRequestPayload): Promise<SocioJoinRequestResponse> {
    try {
      const response = await apiRequest<unknown>(JOIN_REQUEST_ENDPOINT, {
        method: 'POST',
        body: payload,
      })
      return normalizeJoinRequestResponse(response)
    } catch (error) {
      mapJoinRequestError(error)
    }
  },

  async activateAccount(
    payload: SocioAccountActivationPayload,
  ): Promise<SocioAccountActivationResponse> {
    try {
      const response = await apiRequest<unknown>(ACCOUNT_ACTIVATION_ENDPOINT, {
        method: 'POST',
        body: payload,
      })
      return normalizeActivationResponse(response)
    } catch (error) {
      mapActivationError(error)
    }
  },
}
