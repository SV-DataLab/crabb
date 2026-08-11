import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { ApiError } from '../lib/apiClient'
import { createEmptyInstitutionalContent, institutionalService } from '../services/institutionalService'
import type { FooterContent, FooterLegalLink, InstitutionalContent } from '../types/institutional'

const EMPTY_ADMIN_MESSAGE =
  'No hay contenido institucional cargado. Guardá una primera versión desde Sitio Web.'

const emptyLegalLink: FooterLegalLink = {
  label: '',
  url: '',
  order: undefined,
  visible: true,
}

function cloneFooter(footer: FooterContent): FooterContent {
  return {
    copyright: footer.copyright,
    description: footer.description,
    legal_links: (footer.legal_links ?? []).map((item) => ({ ...item })),
  }
}

function sortLegalLinksByOrder(links: FooterLegalLink[]): FooterLegalLink[] {
  return [...links].sort((a, b) => {
    const aOrder = a.order ?? Number.MAX_SAFE_INTEGER
    const bOrder = b.order ?? Number.MAX_SAFE_INTEGER
    return aOrder - bOrder
  })
}

function normalizeLegalLinkOrders(links: FooterLegalLink[]): FooterLegalLink[] {
  return sortLegalLinksByOrder(links).map((link, index) => ({
    ...link,
    order: index + 1,
  }))
}

function sanitizeFooter(footer: FooterContent): FooterContent {
  const legalLinks = normalizeLegalLinkOrders(footer.legal_links ?? []).map((link) => ({
    label: link.label.trim(),
    url: link.url.trim(),
    order: link.order,
    visible: link.visible ?? true,
  }))

  return {
    copyright: footer.copyright.trim(),
    description: footer.description.trim(),
    legal_links: legalLinks,
  }
}

function moveLegalLink(links: FooterLegalLink[], fromIndex: number, toIndex: number): FooterLegalLink[] {
  if (toIndex < 0 || toIndex >= links.length || fromIndex === toIndex) {
    return links
  }

  const next = [...links]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return normalizeLegalLinkOrders(next)
}

export function AdminSitioWebFooterPage() {
  const [content, setContent] = useState<InstitutionalContent>(createEmptyInstitutionalContent)
  const [footer, setFooter] = useState<FooterContent>(() => cloneFooter(createEmptyInstitutionalContent().footer))
  const [formLink, setFormLink] = useState<FooterLegalLink>({ ...emptyLegalLink })
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null)

  const legalLinks = footer.legal_links ?? []
  const sortedLegalLinks = useMemo(() => sortLegalLinksByOrder(legalLinks), [legalLinks])
  const isEditing = editingIndex !== null
  const formActionLabel = editingIndex === null ? 'Agregar enlace' : 'Actualizar enlace'

  useEffect(() => {
    let active = true

    const loadContent = async () => {
      setIsLoading(true)
      setError(null)
      setEmptyMessage(null)

      try {
        const response = await institutionalService.getAdminInstitutionalContent()
        if (!active) return
        const loadedFooter = sanitizeFooter(cloneFooter(response.footer))
        setContent(response)
        setFooter(loadedFooter)
        setFormLink({ ...emptyLegalLink, order: (loadedFooter.legal_links?.length ?? 0) + 1 })
      } catch (err) {
        if (!active) return

        if (err instanceof ApiError) {
          if (err.status === 404) {
            const empty = createEmptyInstitutionalContent()
            setContent(empty)
            setFooter(cloneFooter(empty.footer))
            setFormLink({ ...emptyLegalLink, order: 1 })
            setEmptyMessage(EMPTY_ADMIN_MESSAGE)
          } else if (err.status === 401) {
            setError('Tu sesión expiró. Iniciá sesión nuevamente.')
          } else if (err.status === 403) {
            setError('No tenés permisos para editar el footer del sitio web.')
          } else {
            setError(err.message)
          }
        } else {
          setError('No se pudo cargar el footer del sitio web.')
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

  const resetForm = (nextLinks: FooterLegalLink[]) => {
    setEditingIndex(null)
    setFormLink({ ...emptyLegalLink, order: nextLinks.length + 1 })
  }

  const handleCancel = () => {
    const baseline = sanitizeFooter(cloneFooter(content.footer))
    setFooter(baseline)
    resetForm(baseline.legal_links ?? [])
    setError(null)
    setSuccessMessage(null)
  }

  const handleStartAdd = () => {
    setEditingIndex(null)
    setFormLink({ ...emptyLegalLink, order: legalLinks.length + 1 })
  }

  const handleStartEdit = (link: FooterLegalLink, index: number) => {
    setEditingIndex(index)
    setFormLink({ ...link })
  }

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const nextLinks = moveLegalLink(sortedLegalLinks, index, targetIndex)
    setFooter((prev) => ({ ...prev, legal_links: nextLinks }))

    if (editingIndex !== null) {
      const current = sortedLegalLinks[editingIndex]
      const updatedIndex = nextLinks.findIndex(
        (item) => item.label === current.label && item.url === current.url && item.order === current.order,
      )
      if (updatedIndex >= 0) {
        setEditingIndex(updatedIndex)
        setFormLink({ ...nextLinks[updatedIndex] })
      }
    }
  }

  const handleDelete = (index: number) => {
    const link = sortedLegalLinks[index]
    const label = link.label.trim() || `Enlace ${index + 1}`
    const confirmed = window.confirm(
      `¿Eliminar el enlace legal "${label}"? Esta acción no se guarda hasta confirmar los cambios globales.`,
    )
    if (!confirmed) return

    const nextLinks = normalizeLegalLinkOrders(sortedLegalLinks.filter((_, currentIndex) => currentIndex !== index))
    setFooter((prev) => ({ ...prev, legal_links: nextLinks }))

    if (editingIndex === index) {
      resetForm(nextLinks)
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1)
    }
  }

  const handleToggleVisible = (index: number) => {
    const nextLinks = sortedLegalLinks.map((link, currentIndex) =>
      currentIndex === index ? { ...link, visible: !(link.visible ?? true) } : link,
    )
    setFooter((prev) => ({ ...prev, legal_links: nextLinks }))

    if (editingIndex === index) {
      setFormLink((prev) => ({ ...prev, visible: !(prev.visible ?? true) }))
    }
  }

  const applyFormDraft = () => {
    const draft: FooterLegalLink = {
      label: formLink.label.trim(),
      url: formLink.url.trim(),
      order: formLink.order,
      visible: formLink.visible ?? true,
    }

    if (!draft.label) {
      setError('El label del enlace legal es obligatorio.')
      return
    }

    if (!draft.url) {
      setError('La URL del enlace legal es obligatoria.')
      return
    }

    setError(null)

    if (editingIndex === null) {
      const nextLinks = normalizeLegalLinkOrders([...sortedLegalLinks, draft])
      setFooter((prev) => ({ ...prev, legal_links: nextLinks }))
      resetForm(nextLinks)
      return
    }

    const nextLinks = normalizeLegalLinkOrders(
      sortedLegalLinks.map((link, currentIndex) => (currentIndex === editingIndex ? draft : link)),
    )
    setFooter((prev) => ({ ...prev, legal_links: nextLinks }))
    resetForm(nextLinks)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSaving) return

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    const sanitizedFooter = sanitizeFooter(footer)

    try {
      const updated = await institutionalService.updateInstitutionalPartial({
        footer: sanitizedFooter,
      })
      const updatedFooter = sanitizeFooter(cloneFooter(updated.footer))
      setContent(updated)
      setFooter(updatedFooter)
      resetForm(updatedFooter.legal_links ?? [])
      setSuccessMessage('Footer actualizado correctamente.')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Tu sesión expiró. Iniciá sesión nuevamente.')
        } else if (err.status === 403) {
          setError('No tenés permisos para guardar el footer.')
        } else {
          setError(err.message)
        }
      } else {
        setError('No se pudo guardar el footer del sitio web.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader
          title="Footer"
          subtitle="Administrá el contenido del pie de página visible en la landing pública."
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
          Cargando footer...
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
          <Card className="border-slate-200 shadow-md" title="Contenido general">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Texto de derechos reservados</label>
                <input
                  value={footer.copyright}
                  onChange={(event) => setFooter((prev) => ({ ...prev, copyright: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder="© CRABB Bahía Blanca · Todos los derechos reservados."
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Descripción del footer</label>
                <textarea
                  rows={3}
                  value={footer.description}
                  onChange={(event) => setFooter((prev) => ({ ...prev, description: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder="Representación institucional del ecosistema automotor regional."
                />
              </div>
            </div>
          </Card>

          <Card className="border-slate-200 shadow-md" title="Enlaces legales">
            {sortedLegalLinks.length === 0 ? (
              <p className="text-sm text-slate-500">Todavía no hay enlaces legales cargados.</p>
            ) : (
              <div className="space-y-3">
                {sortedLegalLinks.map((link, index) => {
                  const isVisible = link.visible ?? true

                  return (
                    <div
                      key={`legal-link-${index}-${link.label}`}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-slate-900">
                              {link.label.trim() || `Enlace ${index + 1}`}
                            </h3>
                            <Badge tone={isVisible ? 'green' : 'yellow'}>{isVisible ? 'Visible' : 'Oculto'}</Badge>
                            <span className="text-xs text-slate-500">Orden {link.order ?? index + 1}</span>
                          </div>
                          <p className="mt-1 break-all text-sm text-slate-600">{link.url.trim() || 'Sin URL'}</p>
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
                            disabled={index === sortedLegalLinks.length - 1}
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
                            onClick={() => handleStartEdit(link, index)}
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

          <Card className="border-slate-200 shadow-md" title={isEditing ? 'Editar enlace legal' : 'Agregar enlace legal'}>
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Label</label>
                  <input
                    value={formLink.label}
                    onChange={(event) => setFormLink((prev) => ({ ...prev, label: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="Términos y condiciones"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">URL</label>
                  <input
                    value={formLink.url}
                    onChange={(event) => setFormLink((prev) => ({ ...prev, url: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="/terminos"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Orden</label>
                  <input
                    type="number"
                    min={1}
                    value={formLink.order ?? ''}
                    onChange={(event) =>
                      setFormLink((prev) => ({
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
                    checked={formLink.visible ?? true}
                    onChange={(event) => setFormLink((prev) => ({ ...prev, visible: event.target.checked }))}
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
                    onClick={() => resetForm(legalLinks)}
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
