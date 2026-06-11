import { apiRequest } from '../lib/apiClient'
import type { CampaniaCobranza, CampaniaCobranzaId, SocioCobranza } from '../features/gestion-cobranzas/types'

type UnknownObject = Record<string, unknown>

type ApiEnvelope<T> = {
  ok: boolean
  message: string
  data: T
  errors?: Record<string, string[]> | null
}

function asObject(value: unknown): UnknownObject {
  if (value && typeof value === 'object') {
    return value as UnknownObject
  }
  return {}
}

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return fallback
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value === 'true'
  return fallback
}

function normalizeCampania(row: unknown): CampaniaCobranza | null {
  const source = asObject(row)
  const id = asString(source.id) as CampaniaCobranzaId

  if (!id) return null

  return {
    id,
    label: asString(source.label),
    descripcion: asString(source.descripcion),
    tono: asString(source.tono),
    template: asString(source.template),
  }
}

function normalizeDebtor(row: unknown): SocioCobranza {
  const source = asObject(row)

  return {
    id: asString(source.id),
    nombre: asString(source.nombre),
    telefono: asString(source.telefono),
    estadoCuota: asString(source.estadoCuota, 'pendiente') as SocioCobranza['estadoCuota'],
    mesAdeudado: asString(source.mesAdeudado),
    importeAdeudado: asNumber(source.importeAdeudado),
    activo: asBoolean(source.activo, true),
    estadoEnvio: 'no_seleccionado',
  }
}

export type CollectionsSummary = {
  totalActivos: number
  sociosConDeuda: number
  simulationMode: boolean
  campaigns: CampaniaCobranza[]
}

export type CollectionsDebtorsResponse = {
  debtors: SocioCobranza[]
  total: number
}

export type CollectionsPreviewResponse = {
  renderedMessage: string
  socioId: number
  campaignId: CampaniaCobranzaId
}

export type CollectionsSimulateResponse = {
  simulated: boolean
  socioId: number
  channel: string
  renderedMessage: string
}

function unwrapData<T>(response: unknown): T {
  const root = asObject(response)
  if ('data' in root) {
    return root.data as T
  }
  return response as T
}

export const collectionsService = {
  async getSummary(): Promise<CollectionsSummary> {
    const response = await apiRequest<ApiEnvelope<UnknownObject>>('/admin/collections/summary')
    const data = unwrapData<UnknownObject>(response)
    const campaignsRaw = Array.isArray(data.campaigns) ? data.campaigns : []

    return {
      totalActivos: asNumber(data.totalActivos),
      sociosConDeuda: asNumber(data.sociosConDeuda),
      simulationMode: asBoolean(data.simulationMode, true),
      campaigns: campaignsRaw
        .map(normalizeCampania)
        .filter((item): item is CampaniaCobranza => item !== null),
    }
  },

  async getDebtors(params?: { search?: string; estado_cuota?: string }): Promise<CollectionsDebtorsResponse> {
    const query = new URLSearchParams()
    if (params?.search?.trim()) query.set('search', params.search.trim())
    if (params?.estado_cuota?.trim()) query.set('estado_cuota', params.estado_cuota.trim())

    const suffix = query.toString() ? `?${query.toString()}` : ''
    const response = await apiRequest<ApiEnvelope<UnknownObject>>(`/admin/collections/debtors${suffix}`)
    const data = unwrapData<UnknownObject>(response)
    const debtorsRaw = Array.isArray(data.debtors) ? data.debtors : []

    return {
      debtors: debtorsRaw.map(normalizeDebtor),
      total: asNumber(data.total, debtorsRaw.length),
    }
  },

  async preview(campaignId: CampaniaCobranzaId, socioId?: string): Promise<CollectionsPreviewResponse> {
    const response = await apiRequest<ApiEnvelope<UnknownObject>>('/admin/collections/preview', {
      method: 'POST',
      body: {
        campaign_id: campaignId,
        socio_id: socioId ? Number(socioId) : undefined,
      },
    })
    const data = unwrapData<UnknownObject>(response)

    return {
      renderedMessage: asString(data.renderedMessage),
      socioId: asNumber(data.socioId),
      campaignId: asString(data.campaignId, campaignId) as CampaniaCobranzaId,
    }
  },

  async simulate(
    campaignId: CampaniaCobranzaId,
    socioId: string,
    channel: 'whatsapp' | 'email' = 'whatsapp',
  ): Promise<CollectionsSimulateResponse> {
    const response = await apiRequest<ApiEnvelope<UnknownObject>>('/admin/collections/simulate', {
      method: 'POST',
      body: {
        campaign_id: campaignId,
        socio_id: Number(socioId),
        channel,
      },
    })
    const data = unwrapData<UnknownObject>(response)

    return {
      simulated: asBoolean(data.simulated, true),
      socioId: asNumber(data.socioId),
      channel: asString(data.channel, channel),
      renderedMessage: asString(data.renderedMessage),
    }
  },
}
