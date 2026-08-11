import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { ApiError } from '../lib/apiClient'
import { createEmptyInstitutionalContent, institutionalService } from '../services/institutionalService'
import type { InstitutionalContent } from '../types/institutional'

type SitioWebModule = {
  id: string
  title: string
  description: string
  path: string
  status: string
}

function moduleStatus(content: InstitutionalContent): SitioWebModule[] {
  const visibleServices = content.landing.services.filter((item) => item.visible !== false && item.title.trim())
  const visibleNav = content.landing.navigation.items.filter((item) => item.visible !== false && item.label.trim())
  const legalLinks = content.footer.legal_links ?? []
  const aboutTitle = content.landing.about.title.trim()
  const opportunitiesTitle = content.landing.opportunities.title.trim()

  return [
    {
      id: 'portada',
      title: 'Portada',
      description: 'Hero, títulos y llamadas a la acción',
      path: '/admin/sitio-web/portada',
      status: content.landing.hero.title.trim() || 'Sin título',
    },
    {
      id: 'navegacion',
      title: 'Navegación',
      description: 'Menú público y enlaces del header',
      path: '/admin/sitio-web/navegacion',
      status: `${visibleNav.length} enlace${visibleNav.length === 1 ? '' : 's'} visible${visibleNav.length === 1 ? '' : 's'}`,
    },
    {
      id: 'sobre-crabb',
      title: 'Sobre CRABB',
      description: 'Contenido institucional principal de la landing',
      path: '/admin/sitio-web/sobre-crabb',
      status: aboutTitle || 'Sin contenido',
    },
    {
      id: 'servicios',
      title: 'Servicios',
      description: 'Tarjetas visibles en la landing',
      path: '/admin/sitio-web/servicios',
      status: `${visibleServices.length} visible${visibleServices.length === 1 ? '' : 's'} · ${content.landing.services.length} total`,
    },
    {
      id: 'oportunidades',
      title: 'Oportunidades',
      description: 'Contenido destacado (preparado para la landing)',
      path: '/admin/sitio-web/oportunidades',
      status: opportunitiesTitle || `${content.landing.opportunities.items.length} ítems`,
    },
    {
      id: 'contacto-redes',
      title: 'Contacto',
      description: 'Datos institucionales y redes',
      path: '/admin/sitio-web/contacto-redes',
      status: content.contact.email.trim() || 'Sin email',
    },
    {
      id: 'footer',
      title: 'Footer',
      description: 'Links legales y contenido inferior',
      path: '/admin/sitio-web/footer',
      status: `${legalLinks.length} enlace${legalLinks.length === 1 ? '' : 's'} legal${legalLinks.length === 1 ? '' : 'es'}`,
    },
  ]
}

export function AdminSitioWebPage() {
  const [content, setContent] = useState<InstitutionalContent>(createEmptyInstitutionalContent)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadContent = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await institutionalService.getAdminInstitutionalContent()
        if (!active) return
        setContent(response)
      } catch (err) {
        if (!active) return
        if (err instanceof ApiError && err.status === 404) {
          setContent(createEmptyInstitutionalContent())
        } else if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError('No se pudo cargar el resumen del sitio web.')
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

  const modules = moduleStatus(content)

  return (
    <div className="space-y-4 md:space-y-6">
      <SectionHeader
        title="Sitio Web"
        subtitle="Única superficie para editar el contenido visible de la landing pública."
      />

      <Card className="border-slate-200 shadow-md">
        <p className="text-sm text-slate-600">
          Cada módulo guarda solo su sección. Editar Footer no borra Hero, y editar Servicios no borra
          Sobre CRABB.
        </p>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-md">
          Cargando módulos del sitio web...
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <Link key={module.id} to={module.path} className="group block text-left">
              <Card className="h-full border-slate-200 shadow-md transition group-hover:border-blue-200 group-hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-900">{module.title}</h3>
                  <Badge tone="green">Editar</Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{module.description}</p>
                <p className="mt-3 text-xs font-medium text-slate-500">{module.status}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
