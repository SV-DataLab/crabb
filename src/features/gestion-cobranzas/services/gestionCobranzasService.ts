import { HISTORIAL_STORAGE_KEY } from '../constants'
import { mockHistorialInicial } from '../mocks/mockHistorial'
import type { CampaniaCobranza, CampaniaCobranzaId, CampanaHistorial, ResultadoEnvioMock, SocioCobranza } from '../types'
import { collectionsService } from '../../../services/collectionsService'
import { ApiError } from '../../../lib/apiClient'

function readHistorialFromStorage(): CampanaHistorial[] {
  try {
    const raw = localStorage.getItem(HISTORIAL_STORAGE_KEY)
    if (!raw) return [...mockHistorialInicial]
    const parsed = JSON.parse(raw) as CampanaHistorial[]
    return Array.isArray(parsed) ? parsed : [...mockHistorialInicial]
  } catch {
    return [...mockHistorialInicial]
  }
}

function writeHistorialToStorage(entries: CampanaHistorial[]) {
  localStorage.setItem(HISTORIAL_STORAGE_KEY, JSON.stringify(entries.slice(0, 50)))
}

export type GestionCobranzasResumen = {
  totalActivos: number
  sociosConDeuda: number
  simulationMode: boolean
  campaigns: CampaniaCobranza[]
}

export const gestionCobranzasService = {
  async obtenerResumen(): Promise<GestionCobranzasResumen> {
    const summary = await collectionsService.getSummary()
    return {
      totalActivos: summary.totalActivos,
      sociosConDeuda: summary.sociosConDeuda,
      simulationMode: summary.simulationMode,
      campaigns: summary.campaigns,
    }
  },

  async listarCandidatos(params?: { search?: string; estado_cuota?: string }): Promise<SocioCobranza[]> {
    const response = await collectionsService.getDebtors(params)
    return response.debtors
  },

  async previsualizarMensaje(campaignId: CampaniaCobranzaId, socioId?: string): Promise<string> {
    const preview = await collectionsService.preview(campaignId, socioId)
    return preview.renderedMessage
  },

  async enviarRecordatorio(
    member: SocioCobranza,
    _texto: string,
    campaignId: CampaniaCobranzaId,
  ): Promise<ResultadoEnvioMock> {
    try {
      await collectionsService.simulate(campaignId, member.id, 'whatsapp')
      return { ok: true }
    } catch (error) {
      if (error instanceof ApiError) {
        const telefonoError = error.validationErrors?.telefono?.[0]
        return {
          ok: false,
          error: telefonoError ?? error.message,
        }
      }

      return {
        ok: false,
        error: error instanceof Error ? error.message : 'No se pudo completar el envío simulado',
      }
    }
  },

  async obtenerHistorial(): Promise<CampanaHistorial[]> {
    await Promise.resolve()
    return readHistorialFromStorage()
  },

  guardarEntradaHistorial(entry: CampanaHistorial): CampanaHistorial[] {
    const current = readHistorialFromStorage()
    const updated = [entry, ...current].slice(0, 50)
    writeHistorialToStorage(updated)
    return updated
  },
}
