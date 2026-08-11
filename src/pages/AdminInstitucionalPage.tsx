import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { ApiError } from '../lib/apiClient'
import { createEmptyInstitutionalContent, institutionalService } from '../services/institutionalService'
import type { InstitutionalPageContent } from '../types/institutional'

function clonePage(page: InstitutionalPageContent): InstitutionalPageContent {
  return {
    title: page.title,
    description: page.description,
    authorities: page.authorities.map((item) => ({ ...item })),
    objectives: [...page.objectives],
    benefits: [...page.benefits],
    members_summary: page.members_summary ? { ...page.members_summary } : { total: 0, label: '' },
    fees_summary: page.fees_summary ? { ...page.fees_summary } : { title: '', description: '' },
  }
}

export function AdminInstitucionalPage() {
  const [page, setPage] = useState<InstitutionalPageContent>(() =>
    clonePage(createEmptyInstitutionalContent().institutional_page),
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
        setPage(clonePage(response.institutional_page))
      } catch (err) {
        if (!active) return
        if (err instanceof ApiError && err.status !== 404) {
          setError(err.message)
        } else if (!(err instanceof ApiError)) {
          setError('No se pudo cargar la página institucional interna.')
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

    const authorities = page.authorities
      .map((item) => ({ role: item.role.trim(), name: item.name.trim() }))
      .filter((item) => item.role && item.name)
    const objectives = page.objectives.map((item) => item.trim()).filter(Boolean)
    const benefits = page.benefits.map((item) => item.trim()).filter(Boolean)

    if (!page.title.trim() || authorities.length === 0 || objectives.length === 0 || benefits.length === 0) {
      setError('Completá título, al menos una autoridad, un objetivo y un beneficio.')
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const updated = await institutionalService.updateInstitutionalPartial({
        institutional_page: {
          title: page.title.trim(),
          description: page.description.trim(),
          authorities,
          objectives,
          benefits,
          members_summary: {
            total: Number(page.members_summary?.total) || 0,
            label: page.members_summary?.label.trim() || '',
          },
          fees_summary: {
            title: page.fees_summary?.title.trim() || '',
            description: page.fees_summary?.description.trim() || '',
          },
        },
      })
      setPage(clonePage(updated.institutional_page))
      setSuccessMessage('Página institucional interna actualizada. La web pública se edita en Sitio Web.')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('No se pudo guardar la página institucional interna.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <SectionHeader
        title="Página institucional"
        subtitle="Esta ruta se conserva por compatibilidad. Ya no es un CMS de la landing pública."
      />

      <Card className="border-blue-200 bg-blue-50 shadow-md">
        <p className="text-sm text-blue-900">
          El contenido de la web pública (Hero, Sobre CRABB, Servicios, Footer, navegación) se edita
          únicamente desde{' '}
          <Link to="/admin/sitio-web" className="font-semibold underline">
            Sitio Web
          </Link>
          . Acá solo queda la página interna <span className="font-medium">/institucional</span>.
        </p>
      </Card>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-md">
          Cargando página institucional...
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
          <Card className="border-slate-200 shadow-md" title="Página interna /institucional">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Título</label>
                <input
                  value={page.title}
                  onChange={(event) => setPage((prev) => ({ ...prev, title: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Descripción</label>
                <textarea
                  rows={3}
                  value={page.description}
                  onChange={(event) => setPage((prev) => ({ ...prev, description: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Autoridades (rol | nombre, una por línea)</label>
                <textarea
                  rows={4}
                  value={page.authorities.map((item) => `${item.role} | ${item.name}`).join('\n')}
                  onChange={(event) =>
                    setPage((prev) => ({
                      ...prev,
                      authorities: event.target.value.split('\n').map((line) => {
                        const [role, ...rest] = line.split('|')
                        return { role: (role ?? '').trim(), name: rest.join('|').trim() }
                      }),
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Objetivos (uno por línea)</label>
                <textarea
                  rows={4}
                  value={page.objectives.join('\n')}
                  onChange={(event) =>
                    setPage((prev) => ({ ...prev, objectives: event.target.value.split('\n') }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Beneficios (uno por línea)</label>
                <textarea
                  rows={4}
                  value={page.benefits.join('\n')}
                  onChange={(event) =>
                    setPage((prev) => ({ ...prev, benefits: event.target.value.split('\n') }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Link
              to="/admin/sitio-web"
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Ir a Sitio Web
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {isSaving ? 'Guardando...' : 'Guardar página interna'}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
