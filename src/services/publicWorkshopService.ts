import { ApiError, apiRequest } from '../lib/apiClient'
import { env } from '../config/env'
import type { PublicWorkshop, PublicWorkshopTimeSlot } from '../types/publicWorkshopBooking'

export class PublicWorkshopError extends Error {
  status: number
  notFound: boolean

  constructor(message: string, status: number) {
    super(message)
    this.name = 'PublicWorkshopError'
    this.status = status
    this.notFound = status === 404
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toStringOrEmpty(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

function normalizeWorkshop(raw: unknown): PublicWorkshop {
  if (!isRecord(raw)) {
    throw new Error('La respuesta del taller no tiene el formato esperado.')
  }
  return {
    slug: toStringOrEmpty(raw.slug),
    nombre: toStringOrEmpty(raw.nombre),
    telefono: toStringOrEmpty(raw.telefono),
    direccion: toStringOrEmpty(raw.direccion),
    rubro: toStringOrEmpty(raw.rubro),
    logoUrl: toStringOrNull(raw.logoUrl),
    colorPrimario: toStringOrNull(raw.colorPrimario),
  }
}

function normalizeSlots(raw: unknown): PublicWorkshopTimeSlot[] {
  if (!isRecord(raw) || !Array.isArray(raw.slots)) return []
  return raw.slots
    .filter(isRecord)
    .map((slot) => ({ start: toStringOrEmpty(slot.start), end: toStringOrEmpty(slot.end) }))
    .filter((slot) => slot.start !== '')
}

function toWorkshopError(error: unknown): PublicWorkshopError {
  if (error instanceof ApiError) {
    return new PublicWorkshopError(error.message, error.status)
  }
  if (error instanceof Error) {
    return new PublicWorkshopError(error.message, 0)
  }
  return new PublicWorkshopError('No se pudo conectar con TallerOK.', 0)
}

export const publicWorkshopService = {
  async getBySlug(slug: string, signal?: AbortSignal): Promise<PublicWorkshop> {
    const trimmed = slug.trim()
    if (!trimmed) {
      throw new PublicWorkshopError('El enlace del taller no es válido.', 404)
    }

    try {
      const response = await apiRequest<unknown>(
        `${env.tallerokApiUrl}/talleres/${encodeURIComponent(trimmed)}`,
        { skipAuth: true, signal },
      )
      return normalizeWorkshop(response)
    } catch (error) {
      throw toWorkshopError(error)
    }
  },

  /** `date` en formato `YYYY-MM-DD` (mismo string que emite `<input type="date">`, sin conversión a `Date`/UTC). */
  async getDisponibilidad(
    slug: string,
    date: string,
    signal?: AbortSignal,
  ): Promise<PublicWorkshopTimeSlot[]> {
    const trimmedSlug = slug.trim()
    try {
      const response = await apiRequest<unknown>(
        `${env.tallerokApiUrl}/talleres/${encodeURIComponent(trimmedSlug)}/disponibilidad?date=${encodeURIComponent(date)}`,
        { skipAuth: true, signal },
      )
      return normalizeSlots(response)
    } catch (error) {
      throw toWorkshopError(error)
    }
  },
}
