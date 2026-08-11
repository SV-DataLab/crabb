import { ApiError, apiRequest } from '../lib/apiClient'
import type { SocioMe, UpdateSocioMePayload } from '../types/socioSelfService'
import type { SocioCarnet } from '../types/socioCarnet'

const SOCIO_ME_ENDPOINT = '/socio/me'
const SOCIO_CARNET_ENDPOINT = '/socio/carnet'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toStringOrEmpty(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

function firstDefined<T>(...values: T[]): T | undefined {
  return values.find((value) => value !== undefined)
}

function unwrapData(body: unknown): unknown {
  if (!isRecord(body)) return body
  if ('data' in body && body.data !== undefined) return body.data
  return body
}

function normalizeEmails(value: unknown): string[] | string | null {
  if (Array.isArray(value)) {
    return value.map((item) => toStringOrEmpty(item)).filter(Boolean)
  }
  if (typeof value === 'string') return value
  return null
}

function normalizeSocioMe(raw: unknown): SocioMe {
  const candidate = unwrapData(raw)
  if (!isRecord(candidate)) {
    throw new Error('La respuesta de /socio/me no incluye datos válidos.')
  }

  return {
    id: firstDefined(candidate.id) as number | string | undefined,
    nroSocio: toStringOrEmpty(firstDefined(candidate.nroSocio, candidate.nro_socio)),
    nombreApellido: toStringOrEmpty(firstDefined(candidate.nombreApellido, candidate.nombre_apellido)),
    denominacionTaller:
      toStringOrEmpty(firstDefined(candidate.denominacionTaller, candidate.denominacion_taller)) || null,
    rubro: toStringOrEmpty(candidate.rubro) || null,
    celular: toStringOrEmpty(candidate.celular) || null,
    emails: normalizeEmails(candidate.emails),
    direccion: toStringOrEmpty(candidate.direccion) || null,
    localidad: toStringOrEmpty(candidate.localidad) || null,
    categoria: toStringOrEmpty(candidate.categoria) || null,
    condicion: toStringOrEmpty(candidate.condicion) || null,
    estado: toStringOrEmpty(candidate.estado) || null,
    estadoCuota: toStringOrEmpty(firstDefined(candidate.estadoCuota, candidate.estado_cuota)) || null,
    perfilActualizadoEn:
      toStringOrEmpty(firstDefined(candidate.perfilActualizadoEn, candidate.perfil_actualizado_en)) || null,
  }
}

function normalizeSocioCarnet(raw: unknown): SocioCarnet {
  const candidate = unwrapData(raw)
  if (!isRecord(candidate)) {
    throw new Error('La respuesta de /socio/carnet no incluye datos válidos.')
  }

  const verificationUrl = toStringOrEmpty(
    firstDefined(candidate.verificationUrl, candidate.verification_url),
  )
  const qrPayload = toStringOrEmpty(firstDefined(candidate.qrPayload, candidate.qr_payload))

  return {
    nroSocio: toStringOrEmpty(firstDefined(candidate.nroSocio, candidate.nro_socio)),
    nombreApellido: toStringOrEmpty(firstDefined(candidate.nombreApellido, candidate.nombre_apellido)),
    denominacionTaller:
      toStringOrEmpty(firstDefined(candidate.denominacionTaller, candidate.denominacion_taller)) || null,
    categoria: toStringOrEmpty(candidate.categoria) || null,
    condicion: toStringOrEmpty(candidate.condicion) || null,
    estado: toStringOrEmpty(candidate.estado) || null,
    estadoCarnet: toStringOrEmpty(firstDefined(candidate.estadoCarnet, candidate.estado_carnet)) || 'no_valido',
    verificationUrl,
    qrPayload: qrPayload || verificationUrl,
    perfilActualizadoEn:
      toStringOrEmpty(firstDefined(candidate.perfilActualizadoEn, candidate.perfil_actualizado_en)) || null,
  }
}

function mapSocioError(error: unknown, fallback: string): never {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      throw new Error('Tu sesión expiró. Volvé a iniciar sesión.')
    }
    if (error.status === 403) {
      throw new Error('No tenés permiso para acceder a esta información de socio.')
    }
    if (error.status === 404) {
      throw new Error('No encontramos un socio vinculado a tu cuenta.')
    }
    if (error.status === 422) {
      throw new Error(error.message || 'Revisá los datos ingresados.')
    }
    throw new Error(error.message || fallback)
  }

  if (error instanceof Error) throw error
  throw new Error(fallback)
}

export const socioSelfService = {
  async getMe(): Promise<SocioMe> {
    try {
      const response = await apiRequest<unknown>(SOCIO_ME_ENDPOINT)
      return normalizeSocioMe(response)
    } catch (error) {
      mapSocioError(error, 'No se pudo cargar tu perfil de socio.')
    }
  },

  async updateMe(payload: UpdateSocioMePayload): Promise<SocioMe> {
    try {
      const response = await apiRequest<unknown>(SOCIO_ME_ENDPOINT, {
        method: 'PATCH',
        body: payload,
      })
      return normalizeSocioMe(response)
    } catch (error) {
      mapSocioError(error, 'No se pudo actualizar tu perfil.')
    }
  },

  async getCarnet(): Promise<SocioCarnet> {
    try {
      const response = await apiRequest<unknown>(SOCIO_CARNET_ENDPOINT)
      return normalizeSocioCarnet(response)
    } catch (error) {
      mapSocioError(error, 'No se pudo cargar tu carnet.')
    }
  },
}
