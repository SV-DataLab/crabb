import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { ApiError } from '../lib/apiClient'
import { createEmptyInstitutionalContent, institutionalService } from '../services/institutionalService'
import type { InstitutionalContent, LandingService } from '../types/institutional'

const EMPTY_ADMIN_MESSAGE =
  'No hay contenido institucional cargado. Guardá una primera versión desde Sitio Web.'

const ICON_OPTIONS: Array<{ value: NonNullable<LandingService['icon']>; label: string }> = [
  { value: 'representacion', label: 'Representación' },
  { value: 'capacitacion', label: 'Capacitación' },
  { value: 'data', label: 'Data' },
  { value: 'red', label: 'Red' },
]

const emptyService: LandingService = {
  title: '',
  description: '',
  cta_label: '',
  cta_href: '',
  icon: 'representacion',
  order: undefined,
  visible: true,
}

function cloneServices(services: LandingService[]): LandingService[] {
  return services.map((item) => ({ ...item }))
}

function sortServicesByOrder(services: LandingService[]): LandingService[] {
  return [...services].sort((a, b) => {
    const aOrder = a.order ?? Number.MAX_SAFE_INTEGER
    const bOrder = b.order ?? Number.MAX_SAFE_INTEGER
    return aOrder - bOrder
  })
}

function normalizeServiceOrders(services: LandingService[]): LandingService[] {
  return sortServicesByOrder(services).map((service, index) => ({
    ...service,
    order: index + 1,
  }))
}

function sanitizeServices(services: LandingService[]): LandingService[] {
  return normalizeServiceOrders(services).map((service) => ({
    title: service.title.trim(),
    description: service.description.trim(),
    cta_label: service.cta_label?.trim() ?? '',
    cta_href: service.cta_href?.trim() ?? '',
    icon: service.icon ?? 'representacion',
    order: service.order,
    visible: service.visible ?? true,
  }))
}

function moveService(services: LandingService[], fromIndex: number, toIndex: number): LandingService[] {
  if (toIndex < 0 || toIndex >= services.length || fromIndex === toIndex) {
    return services
  }

  const next = [...services]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return normalizeServiceOrders(next)
}

/**
 * Fusiona el borrador del formulario (título/descripción tipeados) dentro de la lista,
 * aunque el usuario no haya apretado "Actualizar/Agregar servicio" antes de guardar.
 * Sin esto, "Guardar cambios" podía persistir la lista vieja e ignorar en silencio
 * la edición recién tipeada (ver AUDITORIA: servicios institucionales no se reflejaban en público).
 */
function mergeDraftIntoServices(
  services: LandingService[],
  draft: LandingService,
  editingIndex: number | null,
): LandingService[] {
  const trimmedTitle = draft.title.trim()
  if (!trimmedTitle) return services

  const normalizedDraft: LandingService = {
    ...draft,
    title: trimmedTitle,
    description: draft.description.trim(),
    cta_label: draft.cta_label?.trim() ?? '',
    cta_href: draft.cta_href?.trim() ?? '',
    icon: draft.icon ?? 'representacion',
    visible: draft.visible ?? true,
  }

  if (editingIndex === null) {
    return normalizeServiceOrders([...services, normalizedDraft])
  }

  return normalizeServiceOrders(
    services.map((service, index) => (index === editingIndex ? normalizedDraft : service)),
  )
}

export function AdminSitioWebServiciosPage() {
  const [content, setContent] = useState<InstitutionalContent>(createEmptyInstitutionalContent)
  const [services, setServices] = useState<LandingService[]>([])
  const [formService, setFormService] = useState<LandingService>({ ...emptyService })
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null)

  const sortedServices = useMemo(() => sortServicesByOrder(services), [services])
  const isEditing = editingIndex !== null
  const formActionLabel = editingIndex === null ? 'Agregar servicio' : 'Actualizar servicio'

  useEffect(() => {
    let active = true

    const loadContent = async () => {
      setIsLoading(true)
      setError(null)
      setEmptyMessage(null)

      try {
        const response = await institutionalService.getAdminInstitutionalContent()
        if (!active) return
        const loadedServices = normalizeServiceOrders(cloneServices(response.landing.services))
        setContent(response)
        setServices(loadedServices)
        setFormService({ ...emptyService, order: loadedServices.length + 1 })
      } catch (err) {
        if (!active) return

        if (err instanceof ApiError) {
          if (err.status === 404) {
            const empty = createEmptyInstitutionalContent()
            setContent(empty)
            setServices([])
            setFormService({ ...emptyService, order: 1 })
            setEmptyMessage(EMPTY_ADMIN_MESSAGE)
          } else if (err.status === 401) {
            setError('Tu sesión expiró. Iniciá sesión nuevamente.')
          } else if (err.status === 403) {
            setError('No tenés permisos para editar los servicios del sitio web.')
          } else {
            setError(err.message)
          }
        } else {
          setError('No se pudieron cargar los servicios del sitio web.')
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadContent()

    return () => {
      active = false
    }
  }, [])

  const resetForm = (nextServices: LandingService[]) => {
    setEditingIndex(null)
    setFormService({ ...emptyService, order: nextServices.length + 1 })
  }

  const handleCancel = () => {
    const baseline = normalizeServiceOrders(cloneServices(content.landing.services))
    setServices(baseline)
    resetForm(baseline)
    setError(null)
    setSuccessMessage(null)
  }

  const handleStartAdd = () => {
    setEditingIndex(null)
    setFormService({ ...emptyService, order: services.length + 1 })
  }

  const handleStartEdit = (service: LandingService, index: number) => {
    setEditingIndex(index)
    setFormService({ ...service })
  }

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const next = moveService(sortedServices, index, targetIndex)
    setServices(next)

    if (editingIndex !== null) {
      const current = sortedServices[editingIndex]
      const updatedIndex = next.findIndex(
        (item) => item.title === current.title && item.description === current.description && item.order === current.order,
      )
      if (updatedIndex >= 0) {
        setEditingIndex(updatedIndex)
        setFormService({ ...next[updatedIndex] })
      }
    }
  }

  const handleDelete = (index: number) => {
    const service = sortedServices[index]
    const label = service.title.trim() || `Servicio ${index + 1}`
    const confirmed = window.confirm(`¿Eliminar el servicio "${label}"? Esta acción no se guarda hasta confirmar los cambios globales.`)
    if (!confirmed) return

    const next = normalizeServiceOrders(sortedServices.filter((_, currentIndex) => currentIndex !== index))
    setServices(next)

    if (editingIndex === index) {
      resetForm(next)
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1)
    }
  }

  const handleToggleVisible = (index: number) => {
    const next = sortedServices.map((service, currentIndex) =>
      currentIndex === index ? { ...service, visible: !(service.visible ?? true) } : service,
    )
    setServices(next)

    if (editingIndex === index) {
      setFormService((prev) => ({ ...prev, visible: !(prev.visible ?? true) }))
    }
  }

  const applyFormDraft = () => {
    if (!formService.title.trim()) {
      setError('El título del servicio es obligatorio.')
      return
    }

    setError(null)
    const next = mergeDraftIntoServices(sortedServices, formService, editingIndex)
    setServices(next)
    resetForm(next)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSaving) return

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    const servicesToSave = mergeDraftIntoServices(sortedServices, formService, editingIndex)
    const sanitizedServices = sanitizeServices(servicesToSave)

    try {
      const updated = await institutionalService.updateInstitutionalPartial({
        landing: {
          services: sanitizedServices,
        },
      })
      const updatedServices = normalizeServiceOrders(cloneServices(updated.landing.services))
      setContent(updated)
      setServices(updatedServices)
      resetForm(updatedServices)
      setSuccessMessage('Servicios actualizados correctamente.')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Tu sesión expiró. Iniciá sesión nuevamente.')
        } else if (err.status === 403) {
          setError('No tenés permisos para guardar los servicios.')
        } else {
          setError(err.message)
        }
      } else {
        setError('No se pudieron guardar los servicios del sitio web.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader
          title="Servicios"
          subtitle="Administrá las tarjetas de servicios visibles en la landing pública."
        />
        <Link
          to="/admin/sitio-web"
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Volver a Sitio Web
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-md">
          Cargando servicios...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      ) : null}

      {emptyMessage ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">{emptyMessage}</div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {!isLoading ? (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Card className="border-slate-200 shadow-md" title="Lista de servicios">
            {sortedServices.length === 0 ? (
              <p className="text-sm text-slate-500">Todavía no hay servicios cargados.</p>
            ) : (
              <div className="space-y-3">
                {sortedServices.map((service, index) => {
                  const isVisible = service.visible ?? true
                  const iconLabel = ICON_OPTIONS.find((option) => option.value === service.icon)?.label ?? 'Sin icono'

                  return (
                    <div
                      key={`service-row-${index}-${service.title}`}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-slate-900">
                              {service.title.trim() || `Servicio ${index + 1}`}
                            </h3>
                            <Badge tone={isVisible ? 'green' : 'yellow'}>{isVisible ? 'Visible' : 'Oculto'}</Badge>
                            <span className="text-xs text-slate-500">Orden {service.order ?? index + 1}</span>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            {service.description.trim() || 'Sin descripción'}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            Icono: {iconLabel}
                            {service.cta_label?.trim() ? ` · Botón: ${service.cta_label}` : ''}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleMove(index, 'up')}
                            disabled={index === 0}
                            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Subir
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(index, 'down')}
                            disabled={index === sortedServices.length - 1}
                            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Bajar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleVisible(index)}
                            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            {isVisible ? 'Ocultar' : 'Mostrar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(service, index)}
                            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(index)}
                            className="rounded-lg border border-rose-200 bg-white px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          <Card
            className="border-slate-200 shadow-md"
            title={isEditing ? 'Editar servicio' : 'Agregar servicio'}
          >
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Título</label>
                  <input
                    value={formService.title}
                    onChange={(event) => setFormService((prev) => ({ ...prev, title: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="Título del servicio"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Icono</label>
                  <select
                    value={formService.icon ?? 'representacion'}
                    onChange={(event) =>
                      setFormService((prev) => ({
                        ...prev,
                        icon: event.target.value as NonNullable<LandingService['icon']>,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    {ICON_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Descripción</label>
                <textarea
                  rows={3}
                  value={formService.description}
                  onChange={(event) => setFormService((prev) => ({ ...prev, description: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder="Descripción del servicio"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Texto del botón</label>
                  <input
                    value={formService.cta_label ?? ''}
                    onChange={(event) => setFormService((prev) => ({ ...prev, cta_label: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="Ver más"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">URL del botón</label>
                  <input
                    value={formService.cta_href ?? ''}
                    onChange={(event) => setFormService((prev) => ({ ...prev, cta_href: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="/institucional"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Orden</label>
                  <input
                    type="number"
                    min={1}
                    value={formService.order ?? ''}
                    onChange={(event) =>
                      setFormService((prev) => ({
                        ...prev,
                        order: event.target.value === '' ? undefined : Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="1"
                  />
                  <p className="mt-1 text-xs text-slate-500">Al guardar, el orden se normaliza para evitar duplicados.</p>
                </div>

                <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 md:mt-6">
                  <input
                    type="checkbox"
                    checked={formService.visible ?? true}
                    onChange={(event) => setFormService((prev) => ({ ...prev, visible: event.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="text-sm text-slate-700">Visible en la landing</span>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={applyFormDraft}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {formActionLabel}
                </button>
                {isEditing ? (
                  <button
                    type="button"
                    onClick={() => resetForm(services)}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar edición
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartAdd}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Limpiar formulario
                  </button>
                )}
              </div>
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link
              to="/admin/sitio-web"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </Link>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Descartar cambios
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
