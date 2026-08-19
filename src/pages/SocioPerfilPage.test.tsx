import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetMe = vi.fn()
const mockUpdateMe = vi.fn()
const mockUploadFoto = vi.fn()
const mockDeleteFoto = vi.fn()

vi.mock('../services/socioSelfService', async () => {
  const actual =
    await vi.importActual<typeof import('../services/socioSelfService')>('../services/socioSelfService')
  return {
    ...actual,
    socioSelfService: {
      getMe: (...args: unknown[]) => mockGetMe(...args),
      updateMe: (...args: unknown[]) => mockUpdateMe(...args),
      uploadFoto: (...args: unknown[]) => mockUploadFoto(...args),
      deleteFoto: (...args: unknown[]) => mockDeleteFoto(...args),
      getCarnet: vi.fn(),
    },
  }
})

import { SocioPerfilPage } from './SocioPerfilPage'

const BASE_PROFILE = {
  id: 1,
  nroSocio: '301',
  nombreApellido: 'Ana García',
  denominacionTaller: 'Taller Ana',
  rubro: 'Mecánica',
  celular: '2914112301',
  emails: ['ana@test.com'],
  direccion: 'Calle 1',
  categoria: 'socio',
  condicion: 'socio',
  estado: 'activo',
  estadoCuota: 'al_dia',
  fotoUrl: null,
  perfilActualizadoEn: null,
}

function buildFile(name = 'foto.jpg', type = 'image/jpeg', sizeBytes = 1024) {
  const file = new File([new Uint8Array(sizeBytes)], name, { type })
  return file
}

function selectFile(input: HTMLElement, file: File) {
  Object.defineProperty(input, 'files', { value: [file], configurable: true })
  fireEvent.change(input)
}

describe('SocioPerfilPage — foto de carnet', () => {
  beforeEach(() => {
    mockGetMe.mockReset()
    mockUpdateMe.mockReset()
    mockUploadFoto.mockReset()
    mockDeleteFoto.mockReset()
  })

  it('sin foto: muestra el avatar de reemplazo y no ofrece el botón de eliminar', async () => {
    mockGetMe.mockResolvedValueOnce(BASE_PROFILE)
    render(<SocioPerfilPage />)

    await screen.findByText('Mi perfil')
    expect(screen.getByLabelText('Sin foto cargada para Ana García')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Eliminar foto' })).not.toBeInTheDocument()
  })

  it('selector: elegir una imagen válida muestra la previsualización y habilita guardar', async () => {
    mockGetMe.mockResolvedValueOnce(BASE_PROFILE)
    render(<SocioPerfilPage />)
    await screen.findByText('Mi perfil')

    const input = screen.getByLabelText('Seleccionar imagen')
    selectFile(input, buildFile())

    const saveButton = screen.getByRole('button', { name: 'Guardar foto' })
    expect(saveButton).not.toBeDisabled()
  })

  it('validación: rechaza un formato no permitido antes de llamar al backend', async () => {
    mockGetMe.mockResolvedValueOnce(BASE_PROFILE)
    render(<SocioPerfilPage />)
    await screen.findByText('Mi perfil')

    const input = screen.getByLabelText('Seleccionar imagen')
    selectFile(input, buildFile('foto.svg', 'image/svg+xml'))

    expect(await screen.findByText('Formato no permitido. Usá JPEG, PNG o WEBP.')).toBeInTheDocument()
    expect(mockUploadFoto).not.toHaveBeenCalled()
  })

  it('validación: rechaza un archivo mayor a 5 MB antes de llamar al backend', async () => {
    mockGetMe.mockResolvedValueOnce(BASE_PROFILE)
    render(<SocioPerfilPage />)
    await screen.findByText('Mi perfil')

    const input = screen.getByLabelText('Seleccionar imagen')
    selectFile(input, buildFile('grande.jpg', 'image/jpeg', 6 * 1024 * 1024))

    expect(await screen.findByText('La imagen no puede superar los 5 MB.')).toBeInTheDocument()
    expect(mockUploadFoto).not.toHaveBeenCalled()
  })

  it('subida: guarda la foto y muestra mensaje de éxito', async () => {
    mockGetMe.mockResolvedValueOnce(BASE_PROFILE)
    mockUploadFoto.mockResolvedValueOnce({ ...BASE_PROFILE, fotoUrl: 'https://api.test/storage/x.jpg' })
    render(<SocioPerfilPage />)
    await screen.findByText('Mi perfil')

    selectFile(screen.getByLabelText('Seleccionar imagen'), buildFile())
    fireEvent.click(screen.getByRole('button', { name: 'Guardar foto' }))

    expect(await screen.findByText('Tu foto se actualizó correctamente.')).toBeInTheDocument()
    expect(mockUploadFoto).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('img', { name: 'Foto de Ana García' })).toHaveAttribute(
      'src',
      'https://api.test/storage/x.jpg',
    )
  })

  it('reemplazo: con foto existente el botón ofrece "reemplazar" y sube la nueva', async () => {
    mockGetMe.mockResolvedValueOnce({ ...BASE_PROFILE, fotoUrl: 'https://api.test/storage/vieja.jpg' })
    mockUploadFoto.mockResolvedValueOnce({ ...BASE_PROFILE, fotoUrl: 'https://api.test/storage/nueva.jpg' })
    render(<SocioPerfilPage />)
    await screen.findByText('Mi perfil')

    expect(screen.getByRole('button', { name: 'Guardar / reemplazar foto' })).toBeInTheDocument()

    selectFile(screen.getByLabelText('Seleccionar imagen'), buildFile('nueva.jpg'))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar / reemplazar foto' }))

    await waitFor(() =>
      expect(screen.getByRole('img', { name: 'Foto de Ana García' })).toHaveAttribute(
        'src',
        'https://api.test/storage/nueva.jpg',
      ),
    )
  })

  it('eliminación: quita la foto y vuelve a mostrar el avatar de reemplazo', async () => {
    mockGetMe.mockResolvedValueOnce({ ...BASE_PROFILE, fotoUrl: 'https://api.test/storage/x.jpg' })
    mockDeleteFoto.mockResolvedValueOnce({ ...BASE_PROFILE, fotoUrl: null })
    render(<SocioPerfilPage />)
    await screen.findByText('Mi perfil')

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar foto' }))

    expect(await screen.findByText('Tu foto se eliminó correctamente.')).toBeInTheDocument()
    expect(mockDeleteFoto).toHaveBeenCalledTimes(1)
    expect(screen.getByLabelText('Sin foto cargada para Ana García')).toBeInTheDocument()
  })

  it('texto informativo: avisa que la foto será visible al escanear el carnet público', async () => {
    mockGetMe.mockResolvedValueOnce(BASE_PROFILE)
    render(<SocioPerfilPage />)

    expect(
      await screen.findByText(/será visible para cualquier persona que escanee o abra/i),
    ).toBeInTheDocument()
  })
})
