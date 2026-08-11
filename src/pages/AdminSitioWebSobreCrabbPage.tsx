import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { ApiError } from '../lib/apiClient'
import { createEmptyInstitutionalContent, institutionalService } from '../services/institutionalService'
import type { LandingAbout } from '../types/institutional'

const fallbackImageAlt = 'Institucional CRABB — sector automotor regional'

function cloneAbout(about: LandingAbout): LandingAbout {
  return { ...about }
}

function sanitizeAbout(about: LandingAbout): LandingAbout {
  return {
    eyebrow: about.eyebrow.trim(),
    title: about.title.trim(),
    description: about.description.trim(),
    body: about.body.trim(),
    image_url: about.image_url?.trim() ?? '',
    image_alt: about.image_alt?.trim() ?? '',
    visible: about.visible !== false,
  }
}

export function AdminSitioWebSobreCrabbPage() {
  const [about, setAbout] = useState<LandingAbout>(() =>
    cloneAbout(createEmptyInstitutionalContent().landing.about),
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadContent = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await institutionalService.getAdminInstitutionalContent()
        if (!active) return
        setAbout(cloneAbout(response.landing.about))
      } catch (err) {
        if (!active) return
        if (err instanceof ApiError && err.status !== 404) {
          setError(err.message)
        } else if (!(err instanceof ApiError)) {
          setError('No se pudo cargar Sobre CRABB.')
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSaving) return

    const sanitized = sanitizeAbout(about)
    if (!sanitized.title) {
      setError('El título es obligatorio.')
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const updated = await institutionalService.updateInstitutionalPartial({
        landing: { about: sanitized },
      })
      setAbout(cloneAbout(updated.landing.about))
      setSuccessMessage('Sobre CRABB actualizado correctamente.')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('No se pudo guardar Sobre CRABB.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader
          title="Sobre CRABB"
          subtitle="Editá el bloque institucional de la landing pública."
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
          Cargando Sobre CRABB...
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
          <Card className="border-slate-200 shadow-md" title="Contenido">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={about.visible !== false}
                  onChange={(event) => setAbout((prev) => ({ ...prev, visible: event.target.checked }))}
                />
                Mostrar sección en la landing
              </label>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Eyebrow / label</label>
                <input
                  value={about.eyebrow}
                  onChange={(event) => setAbout((prev) => ({ ...prev, eyebrow: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder="Nosotros"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Título</label>
                <input
                  value={about.title}
                  onChange={(event) => setAbout((prev) => ({ ...prev, title: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder="Sobre CRABB"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Descripción principal</label>
                <textarea
                  rows={3}
                  value={about.description}
                  onChange={(event) => setAbout((prev) => ({ ...prev, description: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Párrafo institucional</label>
                <textarea
                  rows={5}
                  value={about.body}
                  onChange={(event) => setAbout((prev) => ({ ...prev, body: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">URL de imagen</label>
                  <input
                    value={about.image_url ?? ''}
                    onChange={(event) => setAbout((prev) => ({ ...prev, image_url: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="/images/landing/about-crabb.jpg"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Se guarda por URL. Si queda vacía, la landing usa la imagen por defecto.
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Texto alternativo</label>
                  <input
                    value={about.image_alt ?? ''}
                    onChange={(event) => setAbout((prev) => ({ ...prev, image_alt: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder={fallbackImageAlt}
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {isSaving ? 'Guardando...' : 'Guardar Sobre CRABB'}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
