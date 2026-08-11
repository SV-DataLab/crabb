import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { ApiError } from '../lib/apiClient'
import { createEmptyInstitutionalContent, institutionalService } from '../services/institutionalService'
import type { InstitutionalContent, LandingHero } from '../types/institutional'

const EMPTY_ADMIN_MESSAGE =
  'No hay contenido institucional cargado. Guardá una primera versión desde Sitio Web.'

const fallbackHeroImageAlt = 'Imagen institucional de CRABB'

function cloneHero(hero: LandingHero): LandingHero {
  return {
    ...hero,
    primary_cta: { ...hero.primary_cta },
    secondary_cta: { ...hero.secondary_cta },
    values: [...(hero.values ?? [])],
    visual: hero.visual
      ? {
          ...hero.visual,
          items: [...(hero.visual.items ?? [])],
        }
      : {
          title: '',
          description: '',
          items: [],
          region_label: '',
        },
  }
}

function sanitizeHero(hero: LandingHero): LandingHero {
  return {
    badge: hero.badge.trim(),
    title: hero.title.trim(),
    subtitle: hero.subtitle.trim(),
    description: hero.description.trim(),
    primary_cta: {
      label: hero.primary_cta.label.trim(),
      url: hero.primary_cta.url.trim(),
    },
    secondary_cta: {
      label: hero.secondary_cta.label.trim(),
      url: hero.secondary_cta.url.trim(),
    },
    image_url: hero.image_url?.trim() ?? '',
    image_alt: hero.image_alt?.trim() ?? '',
    values: hero.values ?? [],
    visual: hero.visual,
  }
}

export function AdminSitioWebPortadaPage() {
  const [content, setContent] = useState<InstitutionalContent>(createEmptyInstitutionalContent)
  const [hero, setHero] = useState<LandingHero>(() => cloneHero(createEmptyInstitutionalContent().landing.hero))
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null)
  const [heroImageLoadError, setHeroImageLoadError] = useState(false)

  useEffect(() => {
    let active = true

    const loadContent = async () => {
      setIsLoading(true)
      setError(null)
      setEmptyMessage(null)

      try {
        const response = await institutionalService.getAdminInstitutionalContent()
        if (!active) return
        setContent(response)
        setHero(cloneHero(response.landing.hero))
        setHeroImageLoadError(false)
      } catch (err) {
        if (!active) return

        if (err instanceof ApiError) {
          if (err.status === 404) {
            const empty = createEmptyInstitutionalContent()
            setContent(empty)
            setHero(cloneHero(empty.landing.hero))
            setEmptyMessage(EMPTY_ADMIN_MESSAGE)
          } else if (err.status === 401) {
            setError('Tu sesión expiró. Iniciá sesión nuevamente.')
          } else if (err.status === 403) {
            setError('No tenés permisos para editar la portada del sitio web.')
          } else {
            setError(err.message)
          }
        } else {
          setError('No se pudo cargar la portada del sitio web.')
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

  const handleCancel = () => {
    setHero(cloneHero(content.landing.hero))
    setError(null)
    setSuccessMessage(null)
    setHeroImageLoadError(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSaving) return

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    const sanitizedHero = sanitizeHero(hero)

    try {
      const updated = await institutionalService.updateInstitutionalPartial({
        landing: {
          hero: sanitizedHero,
          intro: {
            title: sanitizedHero.title,
            description: sanitizedHero.description,
            badge: sanitizedHero.badge,
            subtitle: sanitizedHero.subtitle,
            primary_cta: sanitizedHero.primary_cta,
            secondary_cta: sanitizedHero.secondary_cta,
          },
        },
      })
      setContent(updated)
      setHero(cloneHero(updated.landing.hero))
      setSuccessMessage('Portada actualizada correctamente.')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Tu sesión expiró. Iniciá sesión nuevamente.')
        } else if (err.status === 403) {
          setError('No tenés permisos para guardar la portada.')
        } else {
          setError(err.message)
        }
      } else {
        setError('No se pudo guardar la portada del sitio web.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const heroImageUrl = hero.image_url?.trim() ?? ''
  const hasHeroImage = heroImageUrl.length > 0 && !heroImageLoadError

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader
          title="Portada"
          subtitle="Editá el contenido principal visible al ingresar a la web pública de CRABB."
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
          Cargando portada...
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
          <Card className="border-slate-200 shadow-md" title="Contenido del Hero">
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Badge</label>
                  <input
                    value={hero.badge}
                    onChange={(event) => setHero((prev) => ({ ...prev, badge: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Título</label>
                  <input
                    value={hero.title}
                    onChange={(event) => setHero((prev) => ({ ...prev, title: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Subtítulo</label>
                <input
                  value={hero.subtitle}
                  onChange={(event) => setHero((prev) => ({ ...prev, subtitle: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Descripción</label>
                <textarea
                  rows={3}
                  value={hero.description}
                  onChange={(event) => setHero((prev) => ({ ...prev, description: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">CTA principal label</label>
                  <input
                    value={hero.primary_cta.label}
                    onChange={(event) =>
                      setHero((prev) => ({
                        ...prev,
                        primary_cta: { ...prev.primary_cta, label: event.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">CTA principal URL</label>
                  <input
                    value={hero.primary_cta.url}
                    onChange={(event) =>
                      setHero((prev) => ({
                        ...prev,
                        primary_cta: { ...prev.primary_cta, url: event.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">CTA secundaria label</label>
                  <input
                    value={hero.secondary_cta.label}
                    onChange={(event) =>
                      setHero((prev) => ({
                        ...prev,
                        secondary_cta: { ...prev.secondary_cta, label: event.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">CTA secundaria URL</label>
                  <input
                    value={hero.secondary_cta.url}
                    onChange={(event) =>
                      setHero((prev) => ({
                        ...prev,
                        secondary_cta: { ...prev.secondary_cta, url: event.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">URL de imagen del Hero</label>
                  <input
                    value={hero.image_url ?? ''}
                    onChange={(event) => {
                      setHeroImageLoadError(false)
                      setHero((prev) => ({ ...prev, image_url: event.target.value }))
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="/media/hero-crabb.jpg"
                  />
                  <p className="mt-1 text-xs text-slate-500">La imagen se guarda por URL. No hay upload en esta etapa.</p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Texto alternativo de la imagen</label>
                  <input
                    value={hero.image_alt ?? ''}
                    onChange={(event) => setHero((prev) => ({ ...prev, image_alt: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder={fallbackHeroImageAlt}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200 shadow-md" title="Vista previa simple">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 p-5 text-white">
              {hero.badge.trim() ? (
                <p className="inline-flex rounded-full border border-sky-300/35 bg-sky-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100">
                  {hero.badge}
                </p>
              ) : null}

              <h3 className="mt-4 text-2xl font-bold leading-tight">
                {hero.title.trim() || 'Título de portada'}
              </h3>

              {hero.subtitle.trim() ? <p className="mt-2 text-sm text-sky-200">{hero.subtitle}</p> : null}

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
                {hero.description.trim() || 'Descripción de portada'}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {hero.primary_cta.label.trim() ? (
                  <span className="rounded-md bg-sky-300 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#06213c]">
                    {hero.primary_cta.label}
                  </span>
                ) : null}
                {hero.secondary_cta.label.trim() ? (
                  <span className="rounded-md border border-white/35 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                    {hero.secondary_cta.label}
                  </span>
                ) : null}
              </div>

              {hasHeroImage ? (
                <div className="mt-5 overflow-hidden rounded-lg border border-white/15">
                  <img
                    src={heroImageUrl}
                    alt={hero.image_alt?.trim() || fallbackHeroImageAlt}
                    className="h-40 w-full object-cover"
                    onError={() => setHeroImageLoadError(true)}
                  />
                </div>
              ) : (
                <p className="mt-5 text-xs text-slate-400">Sin imagen cargada o URL inválida.</p>
              )}
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
