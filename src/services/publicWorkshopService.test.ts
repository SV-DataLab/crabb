import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockApiRequest, MockApiError } = vi.hoisted(() => {
  class MockApiError extends Error {
    status: number
    constructor(message: string, status: number) {
      super(message)
      this.status = status
    }
  }
  return { mockApiRequest: vi.fn(), MockApiError }
})

vi.mock('../lib/apiClient', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
  ApiError: MockApiError,
}))

import { publicWorkshopService } from './publicWorkshopService'

describe('publicWorkshopService.getBySlug', () => {
  beforeEach(() => {
    mockApiRequest.mockReset()
  })

  it('arma la URL /talleres/:slug codificando el slug', async () => {
    mockApiRequest.mockResolvedValueOnce({
      nombre: 'Taller García',
      slug: 'taller garcía',
      telefono: '123',
      direccion: 'Calle 1',
      rubro: 'Mecánica',
      logoUrl: null,
      colorPrimario: null,
    })

    await publicWorkshopService.getBySlug('taller garcía')

    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.stringMatching(/\/talleres\/taller%20garc%C3%ADa$/),
      expect.objectContaining({ skipAuth: true }),
    )
  })

  it('nunca reenvía campos internos aunque el backend los incluya en la respuesta (whitelist)', async () => {
    mockApiRequest.mockResolvedValueOnce({
      _id: 'internal-mongo-id',
      crabbSocioId: 'socio-secreto-123',
      crabbSyncStatus: 'LINKED',
      settings: { timezone: 'America/Argentina/Buenos_Aires', maxTurnosPorDia: 8 },
      createdAt: '2026-01-01T00:00:00Z',
      nombre: 'Taller García',
      slug: 'taller-garcia',
      telefono: '11-5555-0000',
      direccion: 'Av. Siempre Viva 123',
      rubro: 'Mecánica general',
      logoUrl: null,
      colorPrimario: null,
    })

    const workshop = await publicWorkshopService.getBySlug('taller-garcia')

    expect(workshop).toEqual({
      slug: 'taller-garcia',
      nombre: 'Taller García',
      telefono: '11-5555-0000',
      direccion: 'Av. Siempre Viva 123',
      rubro: 'Mecánica general',
      logoUrl: null,
      colorPrimario: null,
    })
    expect(workshop).not.toHaveProperty('_id')
    expect(workshop).not.toHaveProperty('crabbSocioId')
    expect(workshop).not.toHaveProperty('crabbSyncStatus')
    expect(workshop).not.toHaveProperty('settings')
    expect(workshop).not.toHaveProperty('createdAt')
  })

  it('un 404 se traduce en PublicWorkshopError con notFound=true', async () => {
    mockApiRequest.mockRejectedValueOnce(new MockApiError('Taller no encontrado', 404))

    await expect(publicWorkshopService.getBySlug('inexistente')).rejects.toMatchObject({
      notFound: true,
      status: 404,
    })
  })

  it('un error de red se traduce en PublicWorkshopError sin notFound', async () => {
    mockApiRequest.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    await expect(publicWorkshopService.getBySlug('taller-garcia')).rejects.toMatchObject({
      notFound: false,
    })
  })
})

describe('publicWorkshopService.getDisponibilidad', () => {
  beforeEach(() => {
    mockApiRequest.mockReset()
  })

  it('usa exactamente el query parameter "date" con el formato YYYY-MM-DD, sin desplazamientos', async () => {
    mockApiRequest.mockResolvedValueOnce({
      date: '2026-08-20',
      timezone: 'America/Argentina/Buenos_Aires',
      slots: [],
    })

    await publicWorkshopService.getDisponibilidad('taller-garcia', '2026-08-20')

    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.stringMatching(/\/talleres\/taller-garcia\/disponibilidad\?date=2026-08-20$/),
      expect.objectContaining({ skipAuth: true }),
    )
  })

  it('devuelve exactamente los horarios reales del backend, sin inventar duraciones', async () => {
    mockApiRequest.mockResolvedValueOnce({
      date: '2026-08-20',
      timezone: 'America/Argentina/Buenos_Aires',
      slots: [
        { start: '09:00', end: '10:00' },
        { start: '10:00', end: '11:00' },
      ],
    })

    const slots = await publicWorkshopService.getDisponibilidad('taller-garcia', '2026-08-20')

    expect(slots).toEqual([
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
    ])
  })

  it('sin horarios para la fecha, devuelve un arreglo vacío en vez de inventar turnos', async () => {
    mockApiRequest.mockResolvedValueOnce({
      date: '2026-08-21',
      timezone: 'America/Argentina/Buenos_Aires',
      slots: [],
    })

    const slots = await publicWorkshopService.getDisponibilidad('taller-garcia', '2026-08-21')

    expect(slots).toEqual([])
  })
})
