import { ApiError, apiRequest } from '../lib/apiClient'
import type { PublicCarnet } from '../types/socioCarnet'

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

function normalizePublicCarnet(raw: unknown): PublicCarnet {
  const candidate = unwrapData(raw)
  if (!isRecord(candidate)) {
    throw new Error('La respuesta de verificación no incluye datos válidos.')
  }

  const estadoCarnet = toStringOrEmpty(firstDefined(candidate.estadoCarnet, candidate.estado_carnet))
  const validRaw = candidate.valid
  const valid =
    typeof validRaw === 'boolean'
      ? validRaw
      : estadoCarnet.trim().toLowerCase() === 'valido'

  return {
    valid,
    nroSocio: toStringOrEmpty(firstDefined(candidate.nroSocio, candidate.nro_socio)),
    nombreApellido: toStringOrEmpty(firstDefined(candidate.nombreApellido, candidate.nombre_apellido)),
    denominacionTaller:
      toStringOrEmpty(firstDefined(candidate.denominacionTaller, candidate.denominacion_taller)) || null,
    categoria: toStringOrEmpty(candidate.categoria) || null,
    condicion: toStringOrEmpty(candidate.condicion) || null,
    estado: toStringOrEmpty(candidate.estado) || null,
    estadoCarnet: estadoCarnet || 'no_valido',
  }
}

export class PublicCarnetError extends Error {
  status: number
  notFound: boolean

  constructor(message: string, status: number) {
    super(message)
    this.name = 'PublicCarnetError'
    this.status = status
    this.notFound = status === 404
  }
}

export const publicCarnetService = {
  async getByToken(token: string): Promise<PublicCarnet> {
    const trimmed = token.trim()
    if (!trimmed) {
      throw new PublicCarnetError('El enlace de verificación no es válido.', 404)
    }

    try {
      const response = await apiRequest<unknown>(`/public/carnet/${encodeURIComponent(trimmed)}`, {
        skipAuth: true,
      })
      return normalizePublicCarnet(response)
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new PublicCarnetError('Carnet no encontrado.', 404)
        }
        throw new PublicCarnetError(error.message || 'No se pudo verificar el carnet.', error.status)
      }
      if (error instanceof Error) {
        throw new PublicCarnetError(error.message, 0)
      }
      throw new PublicCarnetError('No se pudo verificar el carnet.', 0)
    }
  },
}
