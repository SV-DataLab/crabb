import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { isPublicCmsUrl } from '../lib/actionLinks'
import { ApiError } from '../lib/apiClient'
import { createEmptyInstitutionalContent, institutionalService } from '../services/institutionalService'
import type { LandingNavItem, LandingNavigation } from '../types/institutional'

const emptyItem: LandingNavItem = {
  label: '',
  url: '',
  order: undefined,
  visible: true,
}

function cloneNavigation(navigation: LandingNavigation): LandingNavigation {
  return {
    brand_eyebrow: navigation.brand_eyebrow,
    brand_name: navigation.brand_name,
    logo_url: navigation.logo_url,
    items: (navigation.items ?? []).map((item) => ({ ...item })),
  }
}

function sortItems(items: LandingNavItem[]): LandingNavItem[] {
  return [...items].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
}

function normalizeOrders(items: LandingNavItem[]): LandingNavItem[] {
  return sortItems(items).map((item, index) => ({ ...item, order: index + 1 }))
}

export function AdminSitioWebNavegacionPage() {
  const [navigation, setNavigation] = useState<LandingNavigation>(() =>
    cloneNavigation(createEmptyInstitutionalContent().landing.navigation),
  )
  const [formItem, setFormItem] = useState<LandingNavItem>({ ...emptyItem })
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const sortedItems = useMemo(() => sortItems(navigation.items), [navigation.items])
  const isEditing = editingIndex !== null

  useEffect(() => {
    let active = true

    const loadContent = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await institutionalService.getAdminInstitutionalContent()
        if (!active) return
        const loaded = cloneNavigation(response.landing.navigation)
        loaded.items = normalizeOrders(loaded.items)
        setNavigation(loaded)
      } catch (err) {
        if (!active) return
        if (err instanceof ApiError && err.status !== 404) {
          setError(err.message)
        } else if (!(err instanceof ApiError)) {
          setError('No se pudo cargar la navegación pública.')
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

  const resetForm = (items: LandingNavItem[]) => {
    setFormItem({ ...emptyItem, order: items.length + 1 })
    setEditingIndex(null)
  }

  const applyDraft = () => {
    const draft: LandingNavItem = {
      label: formItem.label.trim(),
      url: formItem.url.trim(),
      order: formItem.order,
      visible: formItem.visible ?? true,
    }

    if (!draft.label || !draft.url) {
      setError('Label y URL son obligatorios.')
      return
    }

    if (!isPublicCmsUrl(draft.url)) {
      setError('La URL no es segura. Usá anclas, rutas internas, http(s), mailto o tel. No se permiten javascript:, data:, // ni rutas /admin o /login.')
      return
    }

    setError(null)
    const nextItems =
      editingIndex === null
        ? normalizeOrders([...sortedItems, draft])
        : normalizeOrders(sortedItems.map((item, index) => (index === editingIndex ? draft : item)))
    setNavigation((prev) => ({ ...prev, items: nextItems }))
    resetForm(nextItems)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSaving) return

    const unsafe = navigation.items.find((item) => item.url.trim() && !isPublicCmsUrl(item.url))
    if (unsafe) {
      setError(`La URL de “${unsafe.label || 'un enlace'}” no es segura.`)
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    const payload: LandingNavigation = {
      brand_eyebrow: navigation.brand_eyebrow.trim(),
      brand_name: navigation.brand_name.trim(),
      logo_url: navigation.logo_url?.trim() ?? '',
      items: normalizeOrders(navigation.items).map((item) => ({
        label: item.label.trim(),
        url: item.url.trim(),
        order: item.order,
        visible: item.visible ?? true,
      })),
    }

    try {
      const updated = await institutionalService.updateInstitutionalPartial({
        landing: { navigation: payload },
      })
      const loaded = cloneNavigation(updated.landing.navigation)
      loaded.items = normalizeOrders(loaded.items)
      setNavigation(loaded)
      resetForm(loaded.items)
      setSuccessMessage('Navegación actualizada correctamente.')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('No se pudo guardar la navegación.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader
          title="Navegación"
          subtitle="Administrá el menú público del header. Login y Admin no se editan desde el CMS."
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
          Cargando navegación...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {!isLoading ? (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Card className="border-slate-200 shadow-md" title="Marca pública">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Nombre institucional</label>
                <input
                  value={navigation.brand_eyebrow}
                  onChange={(event) =>
                    setNavigation((prev) => ({ ...prev, brand_eyebrow: event.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Sede / línea corta</label>
                <input
                  value={navigation.brand_name}
                  onChange={(event) =>
                    setNavigation((prev) => ({ ...prev, brand_name: event.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">URL del logo</label>
                <input
                  value={navigation.logo_url ?? ''}
                  onChange={(event) =>
                    setNavigation((prev) => ({ ...prev, logo_url: event.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder="/logo-crabb.jpg"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Opcional. Sin upload: si queda vacío se usa el logo actual.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200 shadow-md" title="Enlaces públicos">
            {sortedItems.length === 0 ? (
              <p className="text-sm text-slate-500">Todavía no hay enlaces. La landing usará el menú por defecto.</p>
            ) : (
              <div className="space-y-3">
                {sortedItems.map((item, index) => {
                  const isVisible = item.visible !== false
                  return (
                    <div key={`${item.label}-${index}`} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-slate-900">{item.label || `Enlace ${index + 1}`}</h3>
                            <Badge tone={isVisible ? 'green' : 'yellow'}>{isVisible ? 'Visible' : 'Oculto'}</Badge>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{item.url}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (index === 0) return
                              const next = [...sortedItems]
                              const [moved] = next.splice(index, 1)
                              next.splice(index - 1, 0, moved)
                              setNavigation((prev) => ({ ...prev, items: normalizeOrders(next) }))
                            }}
                            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Subir
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (index === sortedItems.length - 1) return
                              const next = [...sortedItems]
                              const [moved] = next.splice(index, 1)
                              next.splice(index + 1, 0, moved)
                              setNavigation((prev) => ({ ...prev, items: normalizeOrders(next) }))
                            }}
                            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Bajar
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setNavigation((prev) => ({
                                ...prev,
                                items: prev.items.map((current, currentIndex) =>
                                  currentIndex === index
                                    ? { ...current, visible: current.visible === false }
                                    : current,
                                ),
                              }))
                            }
                            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            {isVisible ? 'Ocultar' : 'Mostrar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormItem({ ...item })
                              setEditingIndex(index)
                            }}
                            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = normalizeOrders(sortedItems.filter((_, currentIndex) => currentIndex !== index))
                              setNavigation((prev) => ({ ...prev, items: next }))
                              resetForm(next)
                            }}
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

          <Card className="border-slate-200 shadow-md" title={isEditing ? 'Editar enlace' : 'Agregar enlace'}>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Label</label>
                <input
                  value={formItem.label}
                  onChange={(event) => setFormItem((prev) => ({ ...prev, label: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">URL</label>
                <input
                  value={formItem.url}
                  onChange={(event) => setFormItem((prev) => ({ ...prev, url: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder="#servicios o /institucional"
                />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={applyDraft}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {isEditing ? 'Actualizar enlace' : 'Agregar enlace'}
              </button>
              {isEditing ? (
                <button
                  type="button"
                  onClick={() => resetForm(sortedItems)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </Card>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {isSaving ? 'Guardando...' : 'Guardar navegación'}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
