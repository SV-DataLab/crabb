import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { ApiError } from '../lib/apiClient'
import { createEmptyInstitutionalContent, institutionalService } from '../services/institutionalService'
import type { InstitutionalContact, InstitutionalContent, SocialLink } from '../types/institutional'

const EMPTY_ADMIN_MESSAGE =
  'No hay contenido institucional cargado. Guardá una primera versión desde Sitio Web.'

const emptySocialLink: SocialLink = {
  platform: '',
  label: '',
  url: '',
  order: undefined,
  visible: true,
}

function cloneContact(contact: InstitutionalContact): InstitutionalContact {
  return { ...contact }
}

function cloneSocialLinks(links: SocialLink[]): SocialLink[] {
  return links.map((item) => ({ ...item }))
}

function isAbsoluteHttpUrl(url: string): boolean {
  const trimmed = url.trim()
  return trimmed.startsWith('http://') || trimmed.startsWith('https://')
}

function sortSocialLinksByOrder(links: SocialLink[]): SocialLink[] {
  return [...links].sort((a, b) => {
    const aOrder = a.order ?? Number.MAX_SAFE_INTEGER
    const bOrder = b.order ?? Number.MAX_SAFE_INTEGER
    return aOrder - bOrder
  })
}

function normalizeSocialLinkOrders(links: SocialLink[]): SocialLink[] {
  return sortSocialLinksByOrder(links).map((link, index) => ({
    ...link,
    order: index + 1,
  }))
}

function sanitizeContact(contact: InstitutionalContact): InstitutionalContact {
  return {
    address: contact.address.trim(),
    email: contact.email.trim(),
    phone: contact.phone.trim(),
    hours: contact.hours.trim(),
  }
}

function sanitizeSocialLinks(links: SocialLink[]): SocialLink[] {
  const filtered = normalizeSocialLinkOrders(links)
    .map((link) => ({
      platform: link.platform.trim(),
      label: link.label?.trim() || undefined,
      url: link.url.trim(),
      order: link.order,
      visible: link.visible ?? true,
    }))
    .filter((link) => link.platform.length > 0 && link.url.length > 0)

  return normalizeSocialLinkOrders(filtered)
}

function moveSocialLink(links: SocialLink[], fromIndex: number, toIndex: number): SocialLink[] {
  if (toIndex < 0 || toIndex >= links.length || fromIndex === toIndex) {
    return links
  }

  const next = [...links]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return normalizeSocialLinkOrders(next)
}

export function AdminSitioWebContactoRedesPage() {
  const [content, setContent] = useState<InstitutionalContent>(createEmptyInstitutionalContent)
  const [contact, setContact] = useState<InstitutionalContact>(() =>
    cloneContact(createEmptyInstitutionalContent().contact),
  )
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [formLink, setFormLink] = useState<SocialLink>({ ...emptySocialLink })
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null)

  const sortedSocialLinks = useMemo(() => sortSocialLinksByOrder(socialLinks), [socialLinks])
  const isEditing = editingIndex !== null
  const formActionLabel = editingIndex === null ? 'Agregar red' : 'Actualizar red'

  useEffect(() => {
    let active = true

    const loadContent = async () => {
      setIsLoading(true)
      setError(null)
      setEmptyMessage(null)

      try {
        const response = await institutionalService.getAdminInstitutionalContent()
        if (!active) return
        const loadedContact = sanitizeContact(cloneContact(response.contact))
        const loadedLinks = normalizeSocialLinkOrders(cloneSocialLinks(response.social_links))
        setContent(response)
        setContact(loadedContact)
        setSocialLinks(loadedLinks)
        setFormLink({ ...emptySocialLink, order: loadedLinks.length + 1 })
      } catch (err) {
        if (!active) return

        if (err instanceof ApiError) {
          if (err.status === 404) {
            const empty = createEmptyInstitutionalContent()
            setContent(empty)
            setContact(cloneContact(empty.contact))
            setSocialLinks([])
            setFormLink({ ...emptySocialLink, order: 1 })
            setEmptyMessage(EMPTY_ADMIN_MESSAGE)
          } else if (err.status === 401) {
            setError('Tu sesión expiró. Iniciá sesión nuevamente.')
          } else if (err.status === 403) {
            setError('No tenés permisos para editar contacto y redes del sitio web.')
          } else {
            setError(err.message)
          }
        } else {
          setError('No se pudo cargar contacto y redes del sitio web.')
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

  const resetForm = (nextLinks: SocialLink[]) => {
    setEditingIndex(null)
    setFormLink({ ...emptySocialLink, order: nextLinks.length + 1 })
  }

  const handleCancel = () => {
    const baselineContact = sanitizeContact(cloneContact(content.contact))
    const baselineLinks = normalizeSocialLinkOrders(cloneSocialLinks(content.social_links))
    setContact(baselineContact)
    setSocialLinks(baselineLinks)
    resetForm(baselineLinks)
    setError(null)
    setSuccessMessage(null)
  }

  const handleStartAdd = () => {
    setEditingIndex(null)
    setFormLink({ ...emptySocialLink, order: socialLinks.length + 1 })
  }

  const handleStartEdit = (link: SocialLink, index: number) => {
    setEditingIndex(index)
    setFormLink({ ...link })
  }

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const nextLinks = moveSocialLink(sortedSocialLinks, index, targetIndex)
    setSocialLinks(nextLinks)

    if (editingIndex !== null) {
      const current = sortedSocialLinks[editingIndex]
      const updatedIndex = nextLinks.findIndex(
        (item) =>
          item.platform === current.platform &&
          item.url === current.url &&
          item.order === current.order &&
          (item.label ?? '') === (current.label ?? ''),
      )
      if (updatedIndex >= 0) {
        setEditingIndex(updatedIndex)
        setFormLink({ ...nextLinks[updatedIndex] })
      }
    }
  }

  const handleDelete = (index: number) => {
    if (sortedSocialLinks.length <= 1) {
      setError('Debés mantener al menos una red social.')
      return
    }

    const link = sortedSocialLinks[index]
    const label = link.label?.trim() || link.platform.trim() || `Red ${index + 1}`
    const confirmed = window.confirm(
      `¿Eliminar la red social "${label}"? Esta acción no se guarda hasta confirmar los cambios globales.`,
    )
    if (!confirmed) return

    const nextLinks = normalizeSocialLinkOrders(
      sortedSocialLinks.filter((_, currentIndex) => currentIndex !== index),
    )
    setSocialLinks(nextLinks)
    setError(null)

    if (editingIndex === index) {
      resetForm(nextLinks)
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1)
    }
  }

  const handleToggleVisible = (index: number) => {
    const nextLinks = sortedSocialLinks.map((link, currentIndex) =>
      currentIndex === index ? { ...link, visible: !(link.visible ?? true) } : link,
    )
    setSocialLinks(nextLinks)

    if (editingIndex === index) {
      setFormLink((prev) => ({ ...prev, visible: !(prev.visible ?? true) }))
    }
  }

  const applyFormDraft = () => {
    const draft: SocialLink = {
      platform: formLink.platform.trim(),
      label: formLink.label?.trim() || undefined,
      url: formLink.url.trim(),
      order: formLink.order,
      visible: formLink.visible ?? true,
    }

    if (!draft.platform) {
      setError('La plataforma de la red social es obligatoria.')
      return
    }

    if (!draft.url) {
      setError('La URL de la red social es obligatoria.')
      return
    }

    if (!isAbsoluteHttpUrl(draft.url)) {
      setError('La URL debe ser absoluta y comenzar con http:// o https://.')
      return
    }

    setError(null)

    if (editingIndex === null) {
      const nextLinks = normalizeSocialLinkOrders([...sortedSocialLinks, draft])
      setSocialLinks(nextLinks)
      resetForm(nextLinks)
      return
    }

    const nextLinks = normalizeSocialLinkOrders(
      sortedSocialLinks.map((link, currentIndex) => (currentIndex === editingIndex ? draft : link)),
    )
    setSocialLinks(nextLinks)
    resetForm(nextLinks)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSaving) return

    const sanitizedContact = sanitizeContact(contact)
    const sanitizedSocialLinks = sanitizeSocialLinks(socialLinks)

    if (sanitizedSocialLinks.length === 0) {
      setError('Debés mantener al menos una red social.')
      return
    }

    const invalidUrl = sanitizedSocialLinks.find((link) => !isAbsoluteHttpUrl(link.url))
    if (invalidUrl) {
      setError('Las URLs de redes sociales deben ser absolutas y comenzar con http:// o https://.')
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const updated = await institutionalService.updateInstitutionalPartial({
        contact: sanitizedContact,
        social_links: sanitizedSocialLinks,
      })
      const updatedContact = sanitizeContact(cloneContact(updated.contact))
      const updatedLinks = normalizeSocialLinkOrders(cloneSocialLinks(updated.social_links))
      setContent(updated)
      setContact(updatedContact)
      setSocialLinks(updatedLinks)
      resetForm(updatedLinks)
      setSuccessMessage('Contacto y redes actualizados correctamente.')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Tu sesión expiró. Iniciá sesión nuevamente.')
        } else if (err.status === 403) {
          setError('No tenés permisos para guardar contacto y redes.')
        } else {
          setError(err.message)
        }
      } else {
        setError('No se pudo guardar contacto y redes del sitio web.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader
          title="Contacto y redes"
          subtitle="Administrá los datos de contacto y los enlaces a redes sociales visibles en la web pública."
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
          Cargando contacto y redes...
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
          <Card className="border-slate-200 shadow-md" title="Datos de contacto">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Dirección</label>
                <input
                  value={contact.address}
                  onChange={(event) => setContact((prev) => ({ ...prev, address: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder="Av. Colón 1234, Bahía Blanca"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(event) => setContact((prev) => ({ ...prev, email: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="contacto@crabb.org.ar"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Teléfono</label>
                  <input
                    value={contact.phone}
                    onChange={(event) => setContact((prev) => ({ ...prev, phone: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="+54 291 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Horarios</label>
                <textarea
                  rows={2}
                  value={contact.hours}
                  onChange={(event) => setContact((prev) => ({ ...prev, hours: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder="Lunes a viernes de 9 a 17 hs"
                />
              </div>
            </div>
          </Card>

          <Card className="border-slate-200 shadow-md" title="Redes sociales">
            {sortedSocialLinks.length === 0 ? (
              <p className="text-sm text-slate-500">Todavía no hay redes sociales cargadas.</p>
            ) : (
              <div className="space-y-3">
                {sortedSocialLinks.map((link, index) => {
                  const isVisible = link.visible ?? true
                  const displayLabel = link.label?.trim() || link.platform.trim() || `Red ${index + 1}`

                  return (
                    <div
                      key={`social-link-${index}-${link.platform}`}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-slate-900">{displayLabel}</h3>
                            <Badge tone={isVisible ? 'green' : 'yellow'}>{isVisible ? 'Visible' : 'Oculta'}</Badge>
                            <span className="text-xs text-slate-500">Orden {link.order ?? index + 1}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">Plataforma: {link.platform.trim() || 'Sin plataforma'}</p>
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
                            disabled={index === sortedSocialLinks.length - 1}
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
                            disabled={sortedSocialLinks.length <= 1}
                            className="rounded-lg border border-rose-200 bg-white px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
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

          <Card className="border-slate-200 shadow-md" title={isEditing ? 'Editar red social' : 'Agregar red social'}>
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Plataforma</label>
                  <input
                    value={formLink.platform}
                    onChange={(event) => setFormLink((prev) => ({ ...prev, platform: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="instagram"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Etiqueta visible</label>
                  <input
                    value={formLink.label ?? ''}
                    onChange={(event) => setFormLink((prev) => ({ ...prev, label: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="Instagram"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">URL</label>
                <input
                  value={formLink.url}
                  onChange={(event) => setFormLink((prev) => ({ ...prev, url: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder="https://instagram.com/crabb"
                />
                <p className="mt-1 text-xs text-slate-500">Debe ser una URL absoluta que comience con http:// o https://.</p>
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
                    onClick={() => resetForm(socialLinks)}
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
