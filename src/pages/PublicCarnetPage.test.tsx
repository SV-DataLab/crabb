import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetByToken = vi.fn()

vi.mock('../services/publicCarnetService', async () => {
  const actual =
    await vi.importActual<typeof import('../services/publicCarnetService')>(
      '../services/publicCarnetService',
    )
  return {
    ...actual,
    publicCarnetService: {
      getByToken: (...args: unknown[]) => mockGetByToken(...args),
    },
  }
})

import { PublicCarnetError } from '../services/publicCarnetService'
import { PublicCarnetPage } from './PublicCarnetPage'

function renderPage(token = 'token-abc') {
  return render(
    <MemoryRouter initialEntries={[`/carnet/${token}`]}>
      <Routes>
        <Route path="/carnet/:token" element={<PublicCarnetPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PublicCarnetPage', () => {
  beforeEach(() => {
    mockGetByToken.mockReset()
  })

  afterEach(() => {
    document.querySelector('meta[name="robots"]')?.remove()
  })

  it('no exige login: no redirige ni muestra formulario de inicio de sesión', async () => {
    mockGetByToken.mockResolvedValueOnce({
      valid: true,
      nroSocio: '301',
      nombreApellido: 'Ana García',
      denominacionTaller: 'Taller Ana',
      categoria: 'socio',
      condicion: 'socio',
      estado: 'activo',
      estadoCarnet: 'valido',
      fotoUrl: null,
    })
    renderPage()

    await screen.findByText('Carnet vigente')
    expect(screen.queryByText(/iniciar sesión/i)).not.toBeInTheDocument()
  })

  it('carnet vigente: muestra "Carnet vigente" y los datos públicos', async () => {
    mockGetByToken.mockResolvedValueOnce({
      valid: true,
      nroSocio: '301',
      nombreApellido: 'Ana García',
      denominacionTaller: 'Taller Ana',
      categoria: 'socio',
      condicion: 'socio',
      estado: 'activo',
      estadoCarnet: 'valido',
      fotoUrl: null,
    })
    renderPage()

    expect(await screen.findByText('Carnet vigente')).toBeInTheDocument()
    expect(screen.getByText('Ana García')).toBeInTheDocument()
  })

  it('carnet no vigente: muestra "Carnet no vigente" sin ocultar los datos básicos', async () => {
    mockGetByToken.mockResolvedValueOnce({
      valid: false,
      nroSocio: '301',
      nombreApellido: 'Ana García',
      denominacionTaller: 'Taller Ana',
      categoria: 'socio',
      condicion: 'socio',
      estado: 'inactivo',
      estadoCarnet: 'no_valido',
      fotoUrl: null,
    })
    renderPage()

    expect(await screen.findByText('Carnet no vigente')).toBeInTheDocument()
  })

  it('token inválido: muestra "Carnet no encontrado" sin datos', async () => {
    mockGetByToken.mockRejectedValueOnce(new PublicCarnetError('Carnet no encontrado.', 404))
    renderPage('token-invalido')

    expect(await screen.findByText('Carnet no encontrado')).toBeInTheDocument()
    expect(screen.queryByText('Ana García')).not.toBeInTheDocument()
  })

  it('error de conexión: muestra un estado distinto, con mensaje genérico y sin datos falsos', async () => {
    mockGetByToken.mockRejectedValueOnce(new PublicCarnetError('TypeError: Failed to fetch at internal://module', 0))
    renderPage()

    expect(await screen.findByText('No se pudo verificar')).toBeInTheDocument()
    expect(screen.getByText('No pudimos verificar el carnet. Probá nuevamente en unos minutos.')).toBeInTheDocument()
    expect(screen.queryByText(/Failed to fetch/)).not.toBeInTheDocument()
    expect(screen.queryByText('Carnet no encontrado')).not.toBeInTheDocument()
  })

  it('muestra el estado de carga mientras verifica', () => {
    mockGetByToken.mockReturnValueOnce(new Promise(() => {}))
    renderPage()

    expect(screen.getByText('Verificando carnet...')).toBeInTheDocument()
  })

  it('con fotoUrl muestra la fotografía; sin fotoUrl muestra el avatar de reemplazo', async () => {
    mockGetByToken.mockResolvedValueOnce({
      valid: true,
      nroSocio: '301',
      nombreApellido: 'Ana García',
      denominacionTaller: null,
      categoria: null,
      condicion: null,
      estado: 'activo',
      estadoCarnet: 'valido',
      fotoUrl: 'https://api.crabbahia.com.ar/storage/socios/fotos/x.jpg',
    })
    renderPage()

    const img = await screen.findByRole('img', { name: 'Foto de Ana García' })
    expect(img).toHaveAttribute('src', 'https://api.crabbahia.com.ar/storage/socios/fotos/x.jpg')
  })

  it('agrega noindex, nofollow para evitar indexación accidental', async () => {
    mockGetByToken.mockResolvedValueOnce({
      valid: true,
      nroSocio: '301',
      nombreApellido: 'Ana García',
      denominacionTaller: null,
      categoria: null,
      condicion: null,
      estado: 'activo',
      estadoCarnet: 'valido',
      fotoUrl: null,
    })
    renderPage()

    await screen.findByText('Carnet vigente')
    const robots = document.querySelector('meta[name="robots"]')
    expect(robots).not.toBeNull()
    expect(robots?.getAttribute('content')).toBe('noindex, nofollow')
  })
})
