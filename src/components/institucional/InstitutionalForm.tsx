import { useEffect, useMemo, useState } from 'react'
import { Card } from '../ui/Card'
import type {
  ActionLink,
  InstitutionalAuthority,
  InstitutionalContent,
  InstitutionalVisibility,
  LandingCampaignSection,
  LandingSection,
  LandingService,
  SocialLink,
} from '../../types/institutional'

type Props = {
  initialValues: InstitutionalContent
  onSubmit: (payload: InstitutionalContent) => Promise<void>
  isSaving?: boolean
}

type SectionId =
  | 'institutional'
  | 'metrics'
  | 'landing'
  | 'featured'
  | 'contact'
  | 'footer'
  | 'visibility'

type NavSection = {
  id: SectionId
  label: string
}

const navSections: NavSection[] = [
  { id: 'institutional', label: 'Pagina institucional' },
  { id: 'metrics', label: 'Metricas internas' },
  { id: 'landing', label: 'Landing principal' },
  { id: 'featured', label: 'Secciones destacadas' },
  { id: 'contact', label: 'Contacto y redes' },
  { id: 'footer', label: 'Footer' },
  { id: 'visibility', label: 'Visibilidad publica' },
]

const emptyAuthority: InstitutionalAuthority = { role: '', name: '' }
const emptySocialLink: SocialLink = { platform: '', url: '' }
const emptyService: LandingService = {
  title: '',
  description: '',
  cta_label: '',
  cta_href: '',
  icon: 'representacion',
  order: undefined,
  visible: true,
}
const fallbackHeroImageAlt = 'Imagen institucional de CRABB'

function cloneValues(values: InstitutionalContent): InstitutionalContent {
  return {
    institutional_page: {
      title: values.institutional_page.title,
      description: values.institutional_page.description,
      authorities: values.institutional_page.authorities.map((item) => ({ ...item })),
      objectives: [...values.institutional_page.objectives],
      members_summary: values.institutional_page.members_summary
        ? { ...values.institutional_page.members_summary }
        : { total: 0, label: '' },
      fees_summary: values.institutional_page.fees_summary
        ? { ...values.institutional_page.fees_summary }
        : { title: '', description: '' },
      benefits: [...values.institutional_page.benefits],
    },
    landing: {
      hero: {
        ...values.landing.hero,
        primary_cta: { ...values.landing.hero.primary_cta },
        secondary_cta: { ...values.landing.hero.secondary_cta },
        values: [...(values.landing.hero.values ?? [])],
        visual: values.landing.hero.visual
          ? {
              ...values.landing.hero.visual,
              items: [...(values.landing.hero.visual.items ?? [])],
            }
          : {
              title: '',
              description: '',
              items: [],
              region_label: '',
            },
      },
      navigation: {
        brand_eyebrow: values.landing.navigation?.brand_eyebrow ?? '',
        brand_name: values.landing.navigation?.brand_name ?? '',
        logo_url: values.landing.navigation?.logo_url ?? '',
        items: (values.landing.navigation?.items ?? []).map((item) => ({ ...item })),
      },
      about: {
        eyebrow: values.landing.about?.eyebrow ?? '',
        title: values.landing.about?.title ?? '',
        description: values.landing.about?.description ?? '',
        body: values.landing.about?.body ?? '',
        image_url: values.landing.about?.image_url ?? '',
        image_alt: values.landing.about?.image_alt ?? '',
        visible: values.landing.about?.visible !== false,
      },
      services: values.landing.services.map((item) => ({ ...item })),
      campaign: {
        ...values.landing.campaign,
        items: [...values.landing.campaign.items],
        cta: { ...values.landing.campaign.cta },
      },
      data_tecnica: {
        ...values.landing.data_tecnica,
        items: [...values.landing.data_tecnica.items],
      },
      capacitaciones: {
        ...values.landing.capacitaciones,
        items: [...values.landing.capacitaciones.items],
      },
      crabb_auxilio: {
        ...values.landing.crabb_auxilio,
        items: [...values.landing.crabb_auxilio.items],
      },
      opportunities: {
        ...values.landing.opportunities,
        items: [...values.landing.opportunities.items],
      },
      final_cta: {
        ...values.landing.final_cta,
        primary_cta: { ...values.landing.final_cta.primary_cta },
        secondary_cta: { ...values.landing.final_cta.secondary_cta },
      },
    },
    contact: { ...values.contact },
    social_links: values.social_links.map((item) => ({ ...item })),
    footer: { ...values.footer },
    visibility: { ...values.visibility },
  }
}

function normalizeStringList(values: string[]): string[] {
  return values.map((item) => item.trim()).filter(Boolean)
}

function sanitizeLink(link: ActionLink): ActionLink {
  return {
    label: link.label.trim(),
    url: link.url.trim(),
  }
}

function sanitizeLandingSection(section: LandingSection): LandingSection {
  return {
    title: section.title.trim(),
    description: section.description.trim(),
    items: normalizeStringList(section.items),
  }
}

function TabNav({
  activeSection,
  onChange,
}: {
  activeSection: SectionId
  onChange: (next: SectionId) => void
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {navSections.map((section) => {
          const isActive = section.id === activeSection
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onChange(section.id)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {section.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DynamicTextList({
  title,
  values,
  addLabel,
  emptyMessage,
  onChange,
}: {
  title: string
  values: string[]
  addLabel: string
  emptyMessage: string
  onChange: (nextValues: string[]) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>

      {values.length === 0 ? <p className="text-sm text-slate-500">{emptyMessage}</p> : null}

      {values.map((value, index) => (
        <div key={`${title}-${index}`} className="flex gap-2">
          <input
            value={value}
            onChange={(event) =>
              onChange(values.map((item, currentIndex) => (currentIndex === index ? event.target.value : item)))
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <button
            type="button"
            className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
            onClick={() => onChange(values.filter((_, currentIndex) => currentIndex !== index))}
          >
            Eliminar
          </button>
        </div>
      ))}

      <button
        type="button"
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        onClick={() => onChange([...values, ''])}
      >
        {addLabel}
      </button>
    </div>
  )
}

function ToggleField({
  label,
  checked,
  description,
  onChange,
}: {
  label: string
  checked: boolean
  description?: string
  onChange: (nextValue: boolean) => void
}) {
  return (
    <label className="rounded-xl border border-slate-200 bg-white p-3">
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-800">{label}</span>
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600"
        />
      </span>
      {description ? <span className="mt-1 block text-xs text-slate-500">{description}</span> : null}
    </label>
  )
}

function FeaturedSectionEditor({
  title,
  section,
  onChange,
}: {
  title: string
  section: LandingSection
  onChange: (next: LandingSection) => void
}) {
  return (
    <Card className="border-slate-200" title={title}>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Titulo</label>
          <input
            value={section.title}
            onChange={(event) => onChange({ ...section, title: event.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Descripcion</label>
          <textarea
            rows={3}
            value={section.description}
            onChange={(event) => onChange({ ...section, description: event.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <DynamicTextList
          title="Items"
          values={section.items}
          addLabel="Agregar item"
          emptyMessage="Sin items cargados."
          onChange={(nextItems) => onChange({ ...section, items: nextItems })}
        />
      </div>
    </Card>
  )
}

function CampaignEditor({
  section,
  onChange,
}: {
  section: LandingCampaignSection
  onChange: (next: LandingCampaignSection) => void
}) {
  return (
    <Card className="border-slate-200" title="Campana de inscripcion">
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Titulo</label>
          <input
            value={section.title}
            onChange={(event) => onChange({ ...section, title: event.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Descripcion</label>
          <textarea
            rows={3}
            value={section.description}
            onChange={(event) => onChange({ ...section, description: event.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <DynamicTextList
          title="Items"
          values={section.items}
          addLabel="Agregar item"
          emptyMessage="Sin items cargados."
          onChange={(nextItems) => onChange({ ...section, items: nextItems })}
        />

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">CTA label</label>
            <input
              value={section.cta.label}
              onChange={(event) => onChange({ ...section, cta: { ...section.cta, label: event.target.value } })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">CTA URL</label>
            <input
              value={section.cta.url}
              onChange={(event) => onChange({ ...section, cta: { ...section.cta, url: event.target.value } })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

export function InstitutionalForm({ initialValues, onSubmit, isSaving = false }: Props) {
  const [state, setState] = useState<InstitutionalContent>(() => cloneValues(initialValues))
  const [activeSection, setActiveSection] = useState<SectionId>('institutional')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [heroImageLoadError, setHeroImageLoadError] = useState(false)
  const [localHeroImagePreviewUrl, setLocalHeroImagePreviewUrl] = useState<string>('')
  const [localHeroImageFileName, setLocalHeroImageFileName] = useState<string>('')

  useEffect(() => {
    setState(cloneValues(initialValues))
    setFieldError(null)
    setHeroImageLoadError(false)
    setLocalHeroImagePreviewUrl('')
    setLocalHeroImageFileName('')
  }, [initialValues])

  useEffect(() => {
    return () => {
      if (localHeroImagePreviewUrl) {
        URL.revokeObjectURL(localHeroImagePreviewUrl)
      }
    }
  }, [localHeroImagePreviewUrl])

  const canSubmit = useMemo(() => !isSaving, [isSaving])
  const heroImageSource = localHeroImagePreviewUrl || state.landing.hero.image_url?.trim() || ''
  const hasHeroImageSource = heroImageSource.length > 0

  const setVisibility = (key: keyof InstitutionalVisibility, value: boolean) => {
    setState((prev) => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [key]: value,
      },
    }))
  }

  const setAuthorities = (next: InstitutionalAuthority[]) => {
    setState((prev) => ({
      ...prev,
      institutional_page: {
        ...prev.institutional_page,
        authorities: next,
      },
    }))
  }

  const setServices = (next: LandingService[]) => {
    setState((prev) => ({
      ...prev,
      landing: {
        ...prev.landing,
        services: next,
      },
    }))
  }

  const setSocialLinks = (next: SocialLink[]) => {
    setState((prev) => ({
      ...prev,
      social_links: next,
    }))
  }

  const handleHeroImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0]

    if (!nextFile) {
      if (localHeroImagePreviewUrl) {
        URL.revokeObjectURL(localHeroImagePreviewUrl)
      }
      setLocalHeroImagePreviewUrl('')
      setLocalHeroImageFileName('')
      setHeroImageLoadError(false)
      return
    }

    if (localHeroImagePreviewUrl) {
      URL.revokeObjectURL(localHeroImagePreviewUrl)
    }

    const objectUrl = URL.createObjectURL(nextFile)
    setLocalHeroImagePreviewUrl(objectUrl)
    setLocalHeroImageFileName(nextFile.name)
    setHeroImageLoadError(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    const hasBrokenAuthority = state.institutional_page.authorities.some((item) => {
      const role = item.role.trim()
      const name = item.name.trim()
      return (role && !name) || (!role && name)
    })

    if (hasBrokenAuthority) {
      setFieldError('Cada autoridad debe incluir cargo y nombre, o eliminarse.')
      return
    }

    const hasBrokenSocial = state.social_links.some((item) => {
      const platform = item.platform.trim()
      const url = item.url.trim()
      return (platform && !url) || (!platform && url)
    })

    if (hasBrokenSocial) {
      setFieldError('Cada red social debe incluir plataforma y URL, o eliminarse.')
      return
    }

    if (!state.institutional_page.title.trim() && !state.institutional_page.description.trim()) {
      setFieldError('Completá al menos el titulo o la descripcion institucional.')
      return
    }

    setFieldError(null)

    const payload: InstitutionalContent = {
      ...state,
      institutional_page: {
        ...state.institutional_page,
        title: state.institutional_page.title.trim(),
        description: state.institutional_page.description.trim(),
        authorities: state.institutional_page.authorities
          .map((item) => ({ role: item.role.trim(), name: item.name.trim() }))
          .filter((item) => item.role && item.name),
        objectives: normalizeStringList(state.institutional_page.objectives),
        benefits: normalizeStringList(state.institutional_page.benefits),
        members_summary: {
          total: Number(state.institutional_page.members_summary?.total) || 0,
          label: state.institutional_page.members_summary?.label.trim() || '',
        },
        fees_summary: {
          title: state.institutional_page.fees_summary?.title.trim() || '',
          description: state.institutional_page.fees_summary?.description.trim() || '',
        },
      },
      landing: {
        hero: {
          badge: state.landing.hero.badge.trim(),
          title: state.landing.hero.title.trim(),
          subtitle: state.landing.hero.subtitle.trim(),
          description: state.landing.hero.description.trim(),
          primary_cta: sanitizeLink(state.landing.hero.primary_cta),
          secondary_cta: sanitizeLink(state.landing.hero.secondary_cta),
          image_url: state.landing.hero.image_url?.trim() ?? '',
          image_alt: state.landing.hero.image_alt?.trim() ?? '',
          values: normalizeStringList(state.landing.hero.values ?? []),
          visual: {
            title: state.landing.hero.visual?.title?.trim() ?? '',
            description: state.landing.hero.visual?.description?.trim() ?? '',
            items: normalizeStringList(state.landing.hero.visual?.items ?? []),
            region_label: state.landing.hero.visual?.region_label?.trim() ?? '',
          },
        },
        navigation: {
          brand_eyebrow: state.landing.navigation?.brand_eyebrow?.trim() ?? '',
          brand_name: state.landing.navigation?.brand_name?.trim() ?? '',
          logo_url: state.landing.navigation?.logo_url?.trim() ?? '',
          items: (state.landing.navigation?.items ?? []).map((item) => ({ ...item })),
        },
        about: {
          eyebrow: state.landing.about?.eyebrow?.trim() ?? '',
          title: state.landing.about?.title?.trim() ?? '',
          description: state.landing.about?.description?.trim() ?? '',
          body: state.landing.about?.body?.trim() ?? '',
          image_url: state.landing.about?.image_url?.trim() ?? '',
          image_alt: state.landing.about?.image_alt?.trim() ?? '',
          visible: state.landing.about?.visible !== false,
        },
        services: state.landing.services
          .map((item) => {
            const icon = item.icon
            const isValidIcon =
              icon === 'representacion' ||
              icon === 'capacitacion' ||
              icon === 'data' ||
              icon === 'red'

            return {
              title: item.title.trim(),
              description: item.description.trim(),
              cta_label: item.cta_label?.trim() ?? '',
              cta_href: item.cta_href?.trim() ?? '',
              icon: isValidIcon ? icon : undefined,
              order:
                item.order === undefined || item.order === null || Number.isNaN(Number(item.order))
                  ? undefined
                  : Number(item.order),
              visible: item.visible ?? true,
            }
          })
          .filter((item) => item.title || item.description || item.cta_label || item.cta_href),
        campaign: {
          ...sanitizeLandingSection(state.landing.campaign),
          cta: sanitizeLink(state.landing.campaign.cta),
        },
        data_tecnica: sanitizeLandingSection(state.landing.data_tecnica),
        capacitaciones: sanitizeLandingSection(state.landing.capacitaciones),
        crabb_auxilio: sanitizeLandingSection(state.landing.crabb_auxilio),
        opportunities: sanitizeLandingSection(state.landing.opportunities),
        final_cta: {
          title: state.landing.final_cta.title.trim(),
          description: state.landing.final_cta.description.trim(),
          primary_cta: sanitizeLink(state.landing.final_cta.primary_cta),
          secondary_cta: sanitizeLink(state.landing.final_cta.secondary_cta),
        },
      },
      contact: {
        address: state.contact.address.trim(),
        email: state.contact.email.trim(),
        phone: state.contact.phone.trim(),
        hours: state.contact.hours.trim(),
      },
      social_links: state.social_links
        .map((item) => ({ platform: item.platform.trim(), url: item.url.trim() }))
        .filter((item) => item.platform && item.url),
      footer: {
        copyright: state.footer.copyright.trim(),
        description: state.footer.description.trim(),
      },
      visibility: {
        ...state.visibility,
      },
    }

    await onSubmit(payload)
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Card className="border-slate-200 shadow-md" title="Contenido institucional">
        <p className="text-sm text-slate-600">Configuracion editable para las secciones publicas de CRABB.</p>
      </Card>

      <TabNav activeSection={activeSection} onChange={setActiveSection} />

      {activeSection === 'institutional' ? (
        <Card className="border-slate-200 shadow-md" title="Pagina institucional">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Titulo</label>
              <input
                value={state.institutional_page.title}
                onChange={(event) =>
                  setState((prev) => ({
                    ...prev,
                    institutional_page: {
                      ...prev.institutional_page,
                      title: event.target.value,
                    },
                  }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Descripcion</label>
              <textarea
                rows={4}
                value={state.institutional_page.description}
                onChange={(event) =>
                  setState((prev) => ({
                    ...prev,
                    institutional_page: {
                      ...prev.institutional_page,
                      description: event.target.value,
                    },
                  }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Autoridades</p>

              {state.institutional_page.authorities.length === 0 ? (
                <p className="text-sm text-slate-500">Todavia no hay autoridades cargadas.</p>
              ) : null}

              {state.institutional_page.authorities.map((authority, index) => (
                <div key={`authority-${index}`} className="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                  <input
                    value={authority.role}
                    onChange={(event) =>
                      setAuthorities(
                        state.institutional_page.authorities.map((item, currentIndex) =>
                          currentIndex === index ? { ...item, role: event.target.value } : item,
                        ),
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="Cargo"
                  />

                  <input
                    value={authority.name}
                    onChange={(event) =>
                      setAuthorities(
                        state.institutional_page.authorities.map((item, currentIndex) =>
                          currentIndex === index ? { ...item, name: event.target.value } : item,
                        ),
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="Nombre"
                  />

                  <button
                    type="button"
                    className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                    onClick={() => setAuthorities(state.institutional_page.authorities.filter((_, currentIndex) => currentIndex !== index))}
                  >
                    Eliminar
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setAuthorities([...state.institutional_page.authorities, { ...emptyAuthority }])}
              >
                Agregar autoridad
              </button>
            </div>

            <DynamicTextList
              title="Objetivos"
              values={state.institutional_page.objectives}
              addLabel="Agregar objetivo"
              emptyMessage="Todavia no hay objetivos cargados."
              onChange={(nextValues) =>
                setState((prev) => ({
                  ...prev,
                  institutional_page: {
                    ...prev.institutional_page,
                    objectives: nextValues,
                  },
                }))
              }
            />

            <DynamicTextList
              title="Beneficios"
              values={state.institutional_page.benefits}
              addLabel="Agregar beneficio"
              emptyMessage="Todavia no hay beneficios cargados."
              onChange={(nextValues) =>
                setState((prev) => ({
                  ...prev,
                  institutional_page: {
                    ...prev.institutional_page,
                    benefits: nextValues,
                  },
                }))
              }
            />
          </div>
        </Card>
      ) : null}

      {activeSection === 'metrics' ? (
        <Card className="border-slate-200 shadow-md" title="Metricas internas">
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Estos datos son internos. Solo se publican si se habilitan explicitamente desde Visibilidad publica.
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Socios totales</label>
                <input
                  type="number"
                  min={0}
                  value={state.institutional_page.members_summary?.total ?? 0}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      institutional_page: {
                        ...prev.institutional_page,
                        members_summary: {
                          total: Number(event.target.value),
                          label: prev.institutional_page.members_summary?.label ?? '',
                        },
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Leyenda socios</label>
                <input
                  value={state.institutional_page.members_summary?.label ?? ''}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      institutional_page: {
                        ...prev.institutional_page,
                        members_summary: {
                          total: prev.institutional_page.members_summary?.total ?? 0,
                          label: event.target.value,
                        },
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Titulo cuotas y pagos</label>
                <input
                  value={state.institutional_page.fees_summary?.title ?? ''}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      institutional_page: {
                        ...prev.institutional_page,
                        fees_summary: {
                          title: event.target.value,
                          description: prev.institutional_page.fees_summary?.description ?? '',
                        },
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Descripcion cuotas y pagos</label>
                <input
                  value={state.institutional_page.fees_summary?.description ?? ''}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      institutional_page: {
                        ...prev.institutional_page,
                        fees_summary: {
                          title: prev.institutional_page.fees_summary?.title ?? '',
                          description: event.target.value,
                        },
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      {activeSection === 'landing' ? (
        <Card className="border-slate-200 shadow-md" title="Landing principal">
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Badge</label>
                <input
                  value={state.landing.hero.badge}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      landing: {
                        ...prev.landing,
                        hero: {
                          ...prev.landing.hero,
                          badge: event.target.value,
                        },
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Titulo</label>
                <input
                  value={state.landing.hero.title}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      landing: {
                        ...prev.landing,
                        hero: {
                          ...prev.landing.hero,
                          title: event.target.value,
                        },
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Subtitulo</label>
              <input
                value={state.landing.hero.subtitle}
                onChange={(event) =>
                  setState((prev) => ({
                    ...prev,
                    landing: {
                      ...prev.landing,
                      hero: {
                        ...prev.landing.hero,
                        subtitle: event.target.value,
                      },
                    },
                  }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Descripcion</label>
              <textarea
                rows={3}
                value={state.landing.hero.description}
                onChange={(event) =>
                  setState((prev) => ({
                    ...prev,
                    landing: {
                      ...prev.landing,
                      hero: {
                        ...prev.landing.hero,
                        description: event.target.value,
                      },
                    },
                  }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">URL de imagen del Hero</label>
                  <input
                    value={state.landing.hero.image_url ?? ''}
                    onChange={(event) => {
                      setHeroImageLoadError(false)
                      setState((prev) => ({
                        ...prev,
                        landing: {
                          ...prev.landing,
                          hero: {
                            ...prev.landing.hero,
                            image_url: event.target.value,
                          },
                        },
                      }))
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="/media/hero-crabb.jpg"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    La imagen se mostrara en la tarjeta principal del Hero. Si se deja vacia, se usara la composicion institucional por defecto.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Texto alternativo de la imagen</label>
                  <input
                    value={state.landing.hero.image_alt ?? ''}
                    onChange={(event) =>
                      setState((prev) => ({
                        ...prev,
                        landing: {
                          ...prev.landing,
                          hero: {
                            ...prev.landing.hero,
                            image_alt: event.target.value,
                          },
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder={fallbackHeroImageAlt}
                  />
                  <p className="mt-1 text-xs text-slate-500">Describe brevemente la imagen para accesibilidad.</p>
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white p-3">
                <label className="mb-1 block text-xs font-medium text-slate-600">Preview local (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeroImageFileChange}
                  className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                />
                <p className="mt-1 text-xs text-slate-500">Carga de archivo pendiente de conexion con backend.</p>
                <p className="mt-1 text-xs text-slate-500">La persistencia actual se realiza por URL. El archivo seleccionado se usa solo para preview temporal.</p>
              </div>

              <div className="mt-3">
                {hasHeroImageSource && !heroImageLoadError ? (
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <img
                      src={heroImageSource}
                      alt={state.landing.hero.image_alt?.trim() || fallbackHeroImageAlt}
                      className="h-44 w-full object-cover"
                      onError={() => setHeroImageLoadError(true)}
                    />
                    {localHeroImageFileName ? (
                      <p className="border-t border-slate-200 px-3 py-2 text-xs text-slate-500">
                        Preview local activo: {localHeroImageFileName}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-4 text-sm text-slate-500">
                    Sin imagen cargada. La landing usara la composicion institucional por defecto.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">CTA principal label</label>
                <input
                  value={state.landing.hero.primary_cta.label}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      landing: {
                        ...prev.landing,
                        hero: {
                          ...prev.landing.hero,
                          primary_cta: {
                            ...prev.landing.hero.primary_cta,
                            label: event.target.value,
                          },
                        },
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">CTA principal URL</label>
                <input
                  value={state.landing.hero.primary_cta.url}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      landing: {
                        ...prev.landing,
                        hero: {
                          ...prev.landing.hero,
                          primary_cta: {
                            ...prev.landing.hero.primary_cta,
                            url: event.target.value,
                          },
                        },
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">CTA secundaria label</label>
                <input
                  value={state.landing.hero.secondary_cta.label}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      landing: {
                        ...prev.landing,
                        hero: {
                          ...prev.landing.hero,
                          secondary_cta: {
                            ...prev.landing.hero.secondary_cta,
                            label: event.target.value,
                          },
                        },
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">CTA secundaria URL</label>
                <input
                  value={state.landing.hero.secondary_cta.url}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      landing: {
                        ...prev.landing,
                        hero: {
                          ...prev.landing.hero,
                          secondary_cta: {
                            ...prev.landing.hero.secondary_cta,
                            url: event.target.value,
                          },
                        },
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Servicios</p>

              {state.landing.services.length === 0 ? (
                <p className="text-sm text-slate-500">Todavia no hay servicios cargados.</p>
              ) : null}

              {state.landing.services.map((service, index) => (
                <div key={`service-${index}`} className="space-y-3 rounded-xl border border-slate-200 p-3">
                  <div className="grid gap-2 md:grid-cols-2">
                    <input
                      value={service.title}
                      onChange={(event) =>
                        setServices(
                          state.landing.services.map((item, currentIndex) =>
                            currentIndex === index ? { ...item, title: event.target.value } : item,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      placeholder="Titulo"
                    />

                    <input
                      value={service.description}
                      onChange={(event) =>
                        setServices(
                          state.landing.services.map((item, currentIndex) =>
                            currentIndex === index ? { ...item, description: event.target.value } : item,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      placeholder="Descripcion"
                    />
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <input
                      value={service.cta_label ?? ''}
                      onChange={(event) =>
                        setServices(
                          state.landing.services.map((item, currentIndex) =>
                            currentIndex === index ? { ...item, cta_label: event.target.value } : item,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      placeholder="CTA label"
                    />

                    <input
                      value={service.cta_href ?? ''}
                      onChange={(event) =>
                        setServices(
                          state.landing.services.map((item, currentIndex) =>
                            currentIndex === index ? { ...item, cta_href: event.target.value } : item,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      placeholder="CTA URL"
                    />
                  </div>

                  <div className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Icono</label>
                      <select
                        value={service.icon ?? 'representacion'}
                        onChange={(event) =>
                          setServices(
                            state.landing.services.map((item, currentIndex) =>
                              currentIndex === index
                                ? {
                                    ...item,
                                    icon: event.target.value as
                                      | 'representacion'
                                      | 'capacitacion'
                                      | 'data'
                                      | 'red',
                                  }
                                : item,
                            ),
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="representacion">Representacion</option>
                        <option value="capacitacion">Capacitacion</option>
                        <option value="data">Data</option>
                        <option value="red">Red</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Orden</label>
                      <input
                        type="number"
                        min={1}
                        value={service.order ?? ''}
                        onChange={(event) =>
                          setServices(
                            state.landing.services.map((item, currentIndex) =>
                              currentIndex === index
                                ? {
                                    ...item,
                                    order:
                                      event.target.value === ''
                                        ? undefined
                                        : Number(event.target.value),
                                  }
                                : item,
                            ),
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                        placeholder="1"
                      />
                    </div>

                    <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                      <input
                        type="checkbox"
                        checked={service.visible ?? true}
                        onChange={(event) =>
                          setServices(
                            state.landing.services.map((item, currentIndex) =>
                              currentIndex === index
                                ? {
                                    ...item,
                                    visible: event.target.checked,
                                  }
                                : item,
                            ),
                          )
                        }
                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      />
                      <span className="text-sm text-slate-700">Visible</span>
                    </label>

                    <button
                      type="button"
                      className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                      onClick={() => setServices(state.landing.services.filter((_, currentIndex) => currentIndex !== index))}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setServices([...state.landing.services, { ...emptyService }])}
              >
                Agregar servicio
              </button>
            </div>
          </div>
        </Card>
      ) : null}

      {activeSection === 'featured' ? (
        <div className="space-y-4">
          <CampaignEditor
            section={state.landing.campaign}
            onChange={(next) =>
              setState((prev) => ({
                ...prev,
                landing: {
                  ...prev.landing,
                  campaign: next,
                },
              }))
            }
          />

          <FeaturedSectionEditor
            title="Data tecnica"
            section={state.landing.data_tecnica}
            onChange={(next) =>
              setState((prev) => ({
                ...prev,
                landing: {
                  ...prev.landing,
                  data_tecnica: next,
                },
              }))
            }
          />

          <FeaturedSectionEditor
            title="Capacitaciones"
            section={state.landing.capacitaciones}
            onChange={(next) =>
              setState((prev) => ({
                ...prev,
                landing: {
                  ...prev.landing,
                  capacitaciones: next,
                },
              }))
            }
          />

          <FeaturedSectionEditor
            title="CRABB Auxilio"
            section={state.landing.crabb_auxilio}
            onChange={(next) =>
              setState((prev) => ({
                ...prev,
                landing: {
                  ...prev.landing,
                  crabb_auxilio: next,
                },
              }))
            }
          />

          <FeaturedSectionEditor
            title="Nuevas oportunidades"
            section={state.landing.opportunities}
            onChange={(next) =>
              setState((prev) => ({
                ...prev,
                landing: {
                  ...prev.landing,
                  opportunities: next,
                },
              }))
            }
          />

          <Card className="border-slate-200" title="CTA final landing">
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Titulo</label>
                <input
                  value={state.landing.final_cta.title}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      landing: {
                        ...prev.landing,
                        final_cta: {
                          ...prev.landing.final_cta,
                          title: event.target.value,
                        },
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Descripcion</label>
                <textarea
                  rows={3}
                  value={state.landing.final_cta.description}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      landing: {
                        ...prev.landing,
                        final_cta: {
                          ...prev.landing.final_cta,
                          description: event.target.value,
                        },
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">CTA principal label</label>
                  <input
                    value={state.landing.final_cta.primary_cta.label}
                    onChange={(event) =>
                      setState((prev) => ({
                        ...prev,
                        landing: {
                          ...prev.landing,
                          final_cta: {
                            ...prev.landing.final_cta,
                            primary_cta: {
                              ...prev.landing.final_cta.primary_cta,
                              label: event.target.value,
                            },
                          },
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">CTA principal URL</label>
                  <input
                    value={state.landing.final_cta.primary_cta.url}
                    onChange={(event) =>
                      setState((prev) => ({
                        ...prev,
                        landing: {
                          ...prev.landing,
                          final_cta: {
                            ...prev.landing.final_cta,
                            primary_cta: {
                              ...prev.landing.final_cta.primary_cta,
                              url: event.target.value,
                            },
                          },
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">CTA secundaria label</label>
                  <input
                    value={state.landing.final_cta.secondary_cta.label}
                    onChange={(event) =>
                      setState((prev) => ({
                        ...prev,
                        landing: {
                          ...prev.landing,
                          final_cta: {
                            ...prev.landing.final_cta,
                            secondary_cta: {
                              ...prev.landing.final_cta.secondary_cta,
                              label: event.target.value,
                            },
                          },
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">CTA secundaria URL</label>
                  <input
                    value={state.landing.final_cta.secondary_cta.url}
                    onChange={(event) =>
                      setState((prev) => ({
                        ...prev,
                        landing: {
                          ...prev.landing,
                          final_cta: {
                            ...prev.landing.final_cta,
                            secondary_cta: {
                              ...prev.landing.final_cta.secondary_cta,
                              url: event.target.value,
                            },
                          },
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {activeSection === 'contact' ? (
        <Card className="border-slate-200 shadow-md" title="Contacto y redes">
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Direccion</label>
                <input
                  value={state.contact.address}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      contact: {
                        ...prev.contact,
                        address: event.target.value,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
                <input
                  type="email"
                  value={state.contact.email}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      contact: {
                        ...prev.contact,
                        email: event.target.value,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Telefono</label>
                <input
                  value={state.contact.phone}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      contact: {
                        ...prev.contact,
                        phone: event.target.value,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Hours</label>
                <input
                  value={state.contact.hours}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      contact: {
                        ...prev.contact,
                        hours: event.target.value,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Redes sociales</p>

              {state.social_links.length === 0 ? (
                <p className="text-sm text-slate-500">Todavia no hay redes sociales cargadas.</p>
              ) : null}

              {state.social_links.map((social, index) => (
                <div key={`social-${index}`} className="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                  <input
                    value={social.platform}
                    onChange={(event) =>
                      setSocialLinks(
                        state.social_links.map((item, currentIndex) =>
                          currentIndex === index ? { ...item, platform: event.target.value } : item,
                        ),
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="Plataforma"
                  />

                  <input
                    value={social.url}
                    onChange={(event) =>
                      setSocialLinks(
                        state.social_links.map((item, currentIndex) =>
                          currentIndex === index ? { ...item, url: event.target.value } : item,
                        ),
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="URL"
                  />

                  <button
                    type="button"
                    className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                    onClick={() => setSocialLinks(state.social_links.filter((_, currentIndex) => currentIndex !== index))}
                  >
                    Eliminar
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setSocialLinks([...state.social_links, { ...emptySocialLink }])}
              >
                Agregar red social
              </button>
            </div>
          </div>
        </Card>
      ) : null}

      {activeSection === 'footer' ? (
        <Card className="border-slate-200 shadow-md" title="Footer">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Copyright</label>
              <input
                value={state.footer.copyright}
                onChange={(event) =>
                  setState((prev) => ({
                    ...prev,
                    footer: {
                      ...prev.footer,
                      copyright: event.target.value,
                    },
                  }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Descripcion</label>
              <textarea
                rows={3}
                value={state.footer.description}
                onChange={(event) =>
                  setState((prev) => ({
                    ...prev,
                    footer: {
                      ...prev.footer,
                      description: event.target.value,
                    },
                  }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>
        </Card>
      ) : null}

      {activeSection === 'visibility' ? (
        <Card className="border-slate-200 shadow-md" title="Visibilidad publica">
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              show_members_summary y show_fees_summary estan desactivados por defecto para evitar publicar metricas internas por accidente.
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <ToggleField
                label="Mostrar autoridades"
                checked={state.visibility.show_authorities}
                onChange={(nextValue) => setVisibility('show_authorities', nextValue)}
              />
              <ToggleField
                label="Mostrar objetivos"
                checked={state.visibility.show_objectives}
                onChange={(nextValue) => setVisibility('show_objectives', nextValue)}
              />
              <ToggleField
                label="Mostrar beneficios"
                checked={state.visibility.show_benefits}
                onChange={(nextValue) => setVisibility('show_benefits', nextValue)}
              />
              <ToggleField
                label="Mostrar contacto"
                checked={state.visibility.show_contact}
                onChange={(nextValue) => setVisibility('show_contact', nextValue)}
              />
              <ToggleField
                label="Mostrar redes sociales"
                checked={state.visibility.show_social_links}
                onChange={(nextValue) => setVisibility('show_social_links', nextValue)}
              />
              <ToggleField
                label="Mostrar resumen de socios"
                checked={state.visibility.show_members_summary}
                description="Solo activar cuando este validado para publicacion."
                onChange={(nextValue) => setVisibility('show_members_summary', nextValue)}
              />
              <ToggleField
                label="Mostrar resumen de cuotas"
                checked={state.visibility.show_fees_summary}
                description="Solo activar cuando este validado para publicacion."
                onChange={(nextValue) => setVisibility('show_fees_summary', nextValue)}
              />
            </div>
          </div>
        </Card>
      ) : null}

      {fieldError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{fieldError}</div>
      ) : null}

      <div className="sticky bottom-2 z-10 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Guardado global: se envia todo el contenido institucional en una sola solicitud.</p>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canSubmit}
          >
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </form>
  )
}
