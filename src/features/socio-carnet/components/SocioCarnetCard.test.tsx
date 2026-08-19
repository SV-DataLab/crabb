import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { SocioCarnet } from '../../../types/socioCarnet'
import { SocioCarnetCard } from './SocioCarnetCard'

vi.mock('react-qr-code', () => ({
  default: ({ value }: { value: string }) => <div data-testid="qr-mock" data-value={value} />,
}))

const BASE_CARNET: SocioCarnet = {
  token: 'token-de-prueba-abc123',
  nroSocio: '301',
  nombreApellido: 'Ana García',
  denominacionTaller: 'Taller Ana',
  categoria: 'socio',
  condicion: 'socio',
  estado: 'activo',
  estadoCarnet: 'valido',
  fotoUrl: null,
  verificationUrl: 'https://api.crabbahia.com.ar/api/public/carnet/token-de-prueba-abc123',
  qrPayload: 'https://api.crabbahia.com.ar/api/public/carnet/token-de-prueba-abc123',
  perfilActualizadoEn: null,
}

describe('SocioCarnetCard', () => {
  it('sin foto muestra el avatar de reemplazo con iniciales', () => {
    render(<SocioCarnetCard carnet={BASE_CARNET} />)

    expect(screen.getByLabelText('Sin foto cargada para Ana García')).toBeInTheDocument()
    expect(screen.getByText('AG')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /foto de ana garcía/i })).not.toBeInTheDocument()
  })

  it('con foto muestra la fotografía del socio', () => {
    render(<SocioCarnetCard carnet={{ ...BASE_CARNET, fotoUrl: 'https://api.crabbahia.com.ar/storage/socios/fotos/x.jpg' }} />)

    const img = screen.getByRole('img', { name: 'Foto de Ana García' })
    expect(img).toHaveAttribute('src', 'https://api.crabbahia.com.ar/storage/socios/fotos/x.jpg')
  })

  it('el QR codifica exactamente la URL pública del frontend actual (window.location.origin + /carnet/token)', async () => {
    render(<SocioCarnetCard carnet={BASE_CARNET} />)

    const qr = await screen.findByTestId('qr-mock')
    expect(qr).toHaveAttribute('data-value', `${window.location.origin}/carnet/token-de-prueba-abc123`)
  })

  it('el enlace copiable usa la misma URL pública que el QR, no la URL directa de la API', async () => {
    render(<SocioCarnetCard carnet={BASE_CARNET} />)

    expect(await screen.findByText(`${window.location.origin}/carnet/token-de-prueba-abc123`)).toBeInTheDocument()
    expect(screen.queryByText(BASE_CARNET.verificationUrl)).not.toBeInTheDocument()
  })
})
