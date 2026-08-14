import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetAdminInstitutionalContent = vi.fn()
const mockUpdateInstitutionalPartial = vi.fn()

vi.mock('../services/institutionalService', async () => {
  const actual =
    await vi.importActual<typeof import('../services/institutionalService')>(
      '../services/institutionalService',
    )
  return {
    ...actual,
    institutionalService: {
      ...actual.institutionalService,
      getAdminInstitutionalContent: (...args: unknown[]) => mockGetAdminInstitutionalContent(...args),
      updateInstitutionalPartial: (...args: unknown[]) => mockUpdateInstitutionalPartial(...args),
    },
  }
})

import { ApiError } from '../lib/apiClient'
import { createEmptyInstitutionalContent } from '../services/institutionalService'
import { AdminSitioWebServiciosPage } from './AdminSitioWebServiciosPage'

const EXISTING_SERVICE = {
  title: 'Representación institucional',
  description:
    'Gestiones y articulación con organismos públicos y privados. Red de conexion de socios de diferentes rubros.',
  cta_label: 'Ver más',
  cta_href: '/contacto',
  icon: 'representacion' as const,
  order: 1,
  visible: true,
}

const NEW_DESCRIPTION =
  'Gestiones y articulación con organismos públicos y privados. Red de conexion de socios de diferentes rubros. Hago cambios.'

function contentWithServices() {
  const content = createEmptyInstitutionalContent()
  content.landing.services = [EXISTING_SERVICE]
  return content
}

function echoUpdate(patch: { landing: { services: typeof EXISTING_SERVICE[] } }) {
  const content = createEmptyInstitutionalContent()
  content.landing.services = patch.landing.services
  return content
}

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminSitioWebServiciosPage />
    </MemoryRouter>,
  )
}

async function startEditingAndChangeDescription(value: string) {
  const editButton = await screen.findByRole('button', { name: 'Editar' })
  fireEvent.click(editButton)

  const descriptionField = screen.getByPlaceholderText('Descripción del servicio')
  fireEvent.change(descriptionField, { target: { value } })
}

describe('AdminSitioWebServiciosPage — edición de servicios', () => {
  beforeEach(() => {
    mockGetAdminInstitutionalContent.mockReset()
    mockUpdateInstitutionalPartial.mockReset()
  })

  it('1-2. guarda la descripción editada aunque no se apriete "Actualizar servicio" antes de "Guardar cambios"', async () => {
    mockGetAdminInstitutionalContent.mockResolvedValueOnce(contentWithServices())
    mockUpdateInstitutionalPartial.mockImplementationOnce(async (patch) => echoUpdate(patch))

    renderPage()
    await startEditingAndChangeDescription(NEW_DESCRIPTION)

    // El usuario guarda directamente, sin apretar "Actualizar servicio" primero.
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(mockUpdateInstitutionalPartial).toHaveBeenCalledTimes(1))

    const payload = mockUpdateInstitutionalPartial.mock.calls[0][0]
    expect(payload.landing.services[0].description).toBe(NEW_DESCRIPTION)

    expect(await screen.findByText('Servicios actualizados correctamente.')).toBeInTheDocument()
  })

  it('3. pulsar "Actualizar servicio" y después "Guardar cambios" sigue funcionando', async () => {
    mockGetAdminInstitutionalContent.mockResolvedValueOnce(contentWithServices())
    mockUpdateInstitutionalPartial.mockImplementationOnce(async (patch) => echoUpdate(patch))

    renderPage()
    await startEditingAndChangeDescription(NEW_DESCRIPTION)

    fireEvent.click(screen.getByRole('button', { name: 'Actualizar servicio' }))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(mockUpdateInstitutionalPartial).toHaveBeenCalledTimes(1))

    const payload = mockUpdateInstitutionalPartial.mock.calls[0][0]
    expect(payload.landing.services[0].description).toBe(NEW_DESCRIPTION)
    expect(await screen.findByText('Servicios actualizados correctamente.')).toBeInTheDocument()
  })

  it('4. conserva cta_label, cta_href, icon, order y visible del servicio editado', async () => {
    mockGetAdminInstitutionalContent.mockResolvedValueOnce(contentWithServices())
    mockUpdateInstitutionalPartial.mockImplementationOnce(async (patch) => echoUpdate(patch))

    renderPage()
    await startEditingAndChangeDescription(NEW_DESCRIPTION)
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(mockUpdateInstitutionalPartial).toHaveBeenCalledTimes(1))

    const service = mockUpdateInstitutionalPartial.mock.calls[0][0].landing.services[0]
    expect(service).toMatchObject({
      title: EXISTING_SERVICE.title,
      cta_label: EXISTING_SERVICE.cta_label,
      cta_href: EXISTING_SERVICE.cta_href,
      icon: EXISTING_SERVICE.icon,
      order: EXISTING_SERVICE.order,
      visible: EXISTING_SERVICE.visible,
    })
  })

  it('5. un error del PUT no muestra un falso mensaje de éxito', async () => {
    mockGetAdminInstitutionalContent.mockResolvedValueOnce(contentWithServices())
    mockUpdateInstitutionalPartial.mockRejectedValueOnce(new ApiError('Error de servidor', 500))

    renderPage()
    await startEditingAndChangeDescription(NEW_DESCRIPTION)
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(mockUpdateInstitutionalPartial).toHaveBeenCalledTimes(1))

    expect(await screen.findByText('Error de servidor')).toBeInTheDocument()
    expect(screen.queryByText('Servicios actualizados correctamente.')).not.toBeInTheDocument()
  })

  it('6. el payload respeta el contrato real: landing.services como único campo enviado', async () => {
    mockGetAdminInstitutionalContent.mockResolvedValueOnce(contentWithServices())
    mockUpdateInstitutionalPartial.mockImplementationOnce(async (patch) => echoUpdate(patch))

    renderPage()
    await startEditingAndChangeDescription(NEW_DESCRIPTION)
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(mockUpdateInstitutionalPartial).toHaveBeenCalledTimes(1))

    const payload = mockUpdateInstitutionalPartial.mock.calls[0][0]
    expect(Object.keys(payload)).toEqual(['landing'])
    expect(Object.keys(payload.landing)).toEqual(['services'])
    expect(Array.isArray(payload.landing.services)).toBe(true)
    expect(payload.landing.services[0]).toEqual(
      expect.objectContaining({
        title: expect.any(String),
        description: expect.any(String),
        cta_label: expect.any(String),
        cta_href: expect.any(String),
        icon: expect.any(String),
        order: expect.any(Number),
        visible: expect.any(Boolean),
      }),
    )
  })
})
