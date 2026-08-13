import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetBySlug = vi.fn()
const mockGetDisponibilidad = vi.fn()

vi.mock('../services/publicWorkshopService', async () => {
  const actual =
    await vi.importActual<typeof import('../services/publicWorkshopService')>(
      '../services/publicWorkshopService',
    )
  return {
    ...actual,
    publicWorkshopService: {
      getBySlug: (...args: unknown[]) => mockGetBySlug(...args),
      getDisponibilidad: (...args: unknown[]) => mockGetDisponibilidad(...args),
    },
  }
})

import { PublicWorkshopError } from '../services/publicWorkshopService'
import { PublicWorkshopBookingPage } from './PublicWorkshopBookingPage'

const WORKSHOP = {
  slug: 'taller-garcia',
  nombre: 'Taller García',
  telefono: '11-5555-0000',
  direccion: 'Av. Siempre Viva 123',
  rubro: 'Mecánica general',
  logoUrl: null,
  colorPrimario: null,
}

function renderPage(slug = 'taller-garcia') {
  return render(
    <MemoryRouter initialEntries={[`/talleres/${slug}/turno`]}>
      <Routes>
        <Route path="/talleres/:slug/turno" element={<PublicWorkshopBookingPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PublicWorkshopBookingPage — taller real', () => {
  beforeEach(() => {
    mockGetBySlug.mockReset()
    mockGetDisponibilidad.mockReset()
  })

  it('carga el taller real por slug y muestra sus datos públicos', async () => {
    mockGetBySlug.mockResolvedValueOnce(WORKSHOP)
    renderPage()

    expect(await screen.findByText('Taller García')).toBeInTheDocument()
    expect(mockGetBySlug).toHaveBeenCalledWith('taller-garcia', expect.anything())
    expect(screen.getByText('Av. Siempre Viva 123')).toBeInTheDocument()
  })

  it('taller inexistente: muestra el estado correspondiente y no la sección de reserva', async () => {
    mockGetBySlug.mockRejectedValueOnce(new PublicWorkshopError('Taller no encontrado', 404))
    renderPage('no-existe')

    expect(await screen.findByText('Taller no encontrado')).toBeInTheDocument()
    expect(screen.queryByText('¿Qué servicio necesitás?')).not.toBeInTheDocument()
  })

  it('error de conexión: muestra el estado de error controlado, sin datos falsos', async () => {
    mockGetBySlug.mockRejectedValueOnce(new PublicWorkshopError('network fail', 0))
    renderPage()

    expect(await screen.findByText('Error temporal de conexión')).toBeInTheDocument()
    expect(screen.queryByText('¿Qué servicio necesitás?')).not.toBeInTheDocument()
  })

  it('no presenta datos ficticios del taller mientras la carga está en curso', () => {
    mockGetBySlug.mockReturnValueOnce(new Promise(() => {}))
    renderPage('taller-demo')

    expect(screen.getByText('Cargando datos del taller…')).toBeInTheDocument()
    expect(screen.queryByText('taller-demo')).not.toBeInTheDocument()
  })

  it('al elegir una fecha, consulta la disponibilidad real con el slug y esa fecha exacta', async () => {
    mockGetBySlug.mockResolvedValueOnce(WORKSHOP)
    mockGetDisponibilidad.mockResolvedValueOnce([{ start: '10:00', end: '11:00' }])
    renderPage()
    await screen.findByText('Taller García')

    fireEvent.change(screen.getByLabelText('Elegí una fecha'), { target: { value: '2026-08-20' } })

    await waitFor(() =>
      expect(mockGetDisponibilidad).toHaveBeenCalledWith(
        'taller-garcia',
        '2026-08-20',
        expect.anything(),
      ),
    )
  })

  it('renderiza únicamente los horarios reales devueltos por el backend', async () => {
    mockGetBySlug.mockResolvedValueOnce(WORKSHOP)
    mockGetDisponibilidad.mockResolvedValueOnce([
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
    ])
    renderPage()
    await screen.findByText('Taller García')

    fireEvent.change(screen.getByLabelText('Elegí una fecha'), { target: { value: '2026-08-20' } })

    expect(await screen.findByRole('button', { name: '09:00' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '10:00' })).toBeInTheDocument()
  })

  it('día sin disponibilidad: muestra el mensaje exacto, sin inventar horarios', async () => {
    mockGetBySlug.mockResolvedValueOnce(WORKSHOP)
    mockGetDisponibilidad.mockResolvedValueOnce([])
    renderPage()
    await screen.findByText('Taller García')

    fireEvent.change(screen.getByLabelText('Elegí una fecha'), { target: { value: '2026-08-21' } })

    expect(
      await screen.findByText('No hay horarios disponibles para esta fecha.'),
    ).toBeInTheDocument()
  })

  it('permite seleccionar un horario disponible', async () => {
    mockGetBySlug.mockResolvedValueOnce(WORKSHOP)
    mockGetDisponibilidad.mockResolvedValueOnce([{ start: '10:00', end: '11:00' }])
    renderPage()
    await screen.findByText('Taller García')
    fireEvent.change(screen.getByLabelText('Elegí una fecha'), { target: { value: '2026-08-20' } })
    const slotButton = await screen.findByRole('button', { name: '10:00' })

    fireEvent.click(slotButton)

    expect(slotButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('cambiar de fecha limpia el horario previamente seleccionado', async () => {
    mockGetBySlug.mockResolvedValueOnce(WORKSHOP)
    mockGetDisponibilidad.mockResolvedValueOnce([{ start: '10:00', end: '11:00' }])
    renderPage()
    await screen.findByText('Taller García')
    fireEvent.change(screen.getByLabelText('Elegí una fecha'), { target: { value: '2026-08-20' } })
    const firstSlot = await screen.findByRole('button', { name: '10:00' })
    fireEvent.click(firstSlot)
    expect(firstSlot).toHaveAttribute('aria-pressed', 'true')

    mockGetDisponibilidad.mockResolvedValueOnce([{ start: '11:00', end: '12:00' }])
    fireEvent.change(screen.getByLabelText('Elegí una fecha'), { target: { value: '2026-08-21' } })

    const newSlot = await screen.findByRole('button', { name: '11:00' })
    expect(newSlot).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByRole('button', { name: '10:00' })).not.toBeInTheDocument()
  })

  it('nunca realiza peticiones POST, ni siquiera con taller y horario cargados', async () => {
    window.fetch = vi.fn()
    mockGetBySlug.mockResolvedValueOnce(WORKSHOP)
    mockGetDisponibilidad.mockResolvedValueOnce([{ start: '10:00', end: '11:00' }])
    renderPage()
    await screen.findByText('Taller García')
    fireEvent.change(screen.getByLabelText('Elegí una fecha'), { target: { value: '2026-08-20' } })
    await screen.findByRole('button', { name: '10:00' })

    fireEvent.click(screen.getByRole('button', { name: 'Solicitar turno' }))

    expect(window.fetch).not.toHaveBeenCalled()
    expect(screen.queryByText(/solicitud enviada/i)).not.toBeInTheDocument()
  })
})
