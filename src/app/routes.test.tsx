/**
 * `/talleres/:slug/turno` es una ruta pública nueva que debe convivir con
 * `/carnet/:token` (ya existente) sin romperla. Ambas se prueban armando la
 * URL directamente en `window.history` ANTES de crear el router — así se
 * simula abrir el enlace pegado en el navegador, no una navegación interna
 * de React.
 */
import { render, screen } from '@testing-library/react'
import { RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('rutas públicas', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('reconoce /talleres/:slug/turno y la renderiza con entrada directa por URL, sin exigir login', async () => {
    window.history.pushState({}, '', '/talleres/taller-demo/turno')
    const { router } = await import('./routes')

    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { name: 'Solicitá un turno' })).toBeInTheDocument()
    expect(screen.queryByText(/iniciar sesión/i)).not.toBeInTheDocument()
  })

  it('conserva /carnet/:token', async () => {
    window.history.pushState({}, '', '/carnet/un-token-cualquiera')
    const { router } = await import('./routes')

    render(<RouterProvider router={router} />)

    expect(await screen.findByText('Verificación de carnet')).toBeInTheDocument()
  })
})
