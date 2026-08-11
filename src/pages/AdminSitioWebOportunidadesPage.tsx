import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { ApiError } from '../lib/apiClient'
import { createEmptyInstitutionalContent, institutionalService } from '../services/institutionalService'
import type { LandingSection } from '../types/institutional'

function cloneSection(section: LandingSection): LandingSection {
  return {
    title: section.title,
    description: section.description,
    items: [...section.items],
  }
}

function sanitizeSection(section: LandingSection): LandingSection {
  return {
    title: section.title.trim(),
    description: section.description.trim(),
    items: section.items.map((item) => item.trim()).filter(Boolean),
  }
}

export function AdminSitioWebOportunidadesPage() {
  const [section, setSection] = useState<LandingSection>(() =>
    cloneSection(createEmptyInstitutionalContent().landing.opportunities),
  )
  const [itemDraft, setItemDraft] = useState('')
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
        setSection(cloneSection(response.landing.opportunities))
      } catch (err) {
        if (!active) return
        if (err instanceof ApiError && err.status !== 404) {
          setError(err.message)
        } else if (!(err instanceof ApiError)) {
          setError('No se pudieron cargar las oportunidades.')
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

    const sanitized = sanitizeSection(section)
    if (!sanitized.title) {
      setError('El título es obligatorio.')
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const updated = await institutionalService.updateInstitutionalPartial({
        landing: { opportunities: sanitized },
      })
      setSection(cloneSection(updated.landing.opportunities))
      setSuccessMessage('Oportunidades actualizadas. El contenido queda listo para la próxima etapa de landing.')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('No se pudieron guardar las oportunidades.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader
          title="Oportunidades"
          subtitle="Administrá landing.opportunities. Esta landing reducida todavía no lo renderiza."
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
          Cargando oportunidades...
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
          <Card className="border-slate-200 shadow-md" title="Nuevas oportunidades">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Título</label>
                <input
                  value={section.title}
                  onChange={(event) => setSection((prev) => ({ ...prev, title: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Descripción</label>
                <textarea
                  rows={3}
                  value={section.description}
                  onChange={(event) => setSection((prev) => ({ ...prev, description: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-slate-600">Ítems</p>
                {section.items.length === 0 ? (
                  <p className="text-sm text-slate-500">Sin ítems cargados.</p>
                ) : (
                  <ul className="space-y-2">
                    {section.items.map((item, index) => (
                      <li key={`${item}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
                        <span className="text-sm text-slate-700">{item}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSection((prev) => ({
                              ...prev,
                              items: prev.items.filter((_, currentIndex) => currentIndex !== index),
                            }))
                          }
                          className="text-xs font-medium text-rose-700 hover:underline"
                        >
                          Quitar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3 flex gap-2">
                  <input
                    value={itemDraft}
                    onChange={(event) => setItemDraft(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="Agregar ítem"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = itemDraft.trim()
                      if (!next) return
                      setSection((prev) => ({ ...prev, items: [...prev.items, next] }))
                      setItemDraft('')
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Agregar
                  </button>
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
              {isSaving ? 'Guardando...' : 'Guardar oportunidades'}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
