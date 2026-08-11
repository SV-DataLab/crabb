import type {
  ActionLink,
  InstitutionalAuthority,
  InstitutionalContent,
  InstitutionalVisibility,
  LandingAbout,
  LandingNavigation,
  LandingSection,
  LandingService,
} from '../../types/institutional'

const TRAINING_EXTERNAL_URL = 'https://faatra.org.ar/capacitaciones/snit'

type PreviewLandingSection = {
  title: string
  description: string
  items: string[]
}

type PreviewFooter = {
  copyright: string
  description: string
  legal_links: ActionLink[]
}

export type InstitutionalPreviewContract = {
  institutional_page: {
    title: string
    description: string
    authorities: InstitutionalAuthority[]
    objectives: string[]
    benefits: string[]
  }
  landing: {
    badge: string
    title: string
    description: string
    primary_cta: ActionLink
    secondary_cta: ActionLink
    image_url: string
    image_alt: string
    values: string[]
    visual: {
      title: string
      description: string
      items: string[]
      region_label: string
    }
    services: LandingService[]
    campaign: PreviewLandingSection & { cta: ActionLink }
    data_technical: PreviewLandingSection
    trainings: PreviewLandingSection
    assistance: PreviewLandingSection
    opportunities: PreviewLandingSection
    final_cta: {
      title: string
      description: string
      primary_cta: ActionLink
      secondary_cta: ActionLink
    }
  }
  contact: {
    address: string
    email: string
    phone: string
    hours: string
  }
  social_links: Array<{ platform: string; url: string }>
  footer: PreviewFooter
  visibility: Partial<InstitutionalVisibility>
}

export const institutionalPreviewData: InstitutionalPreviewContract = {
  institutional_page: {
    title: 'Institucional CRABB',
    description:
      'Articulamos al ecosistema automotor regional para fortalecer su competitividad y representacion institucional.',
    authorities: [
      { role: 'Presidencia', name: 'Comision Directiva CRABB' },
      { role: 'Secretaria General', name: 'Equipo de Gestion Institucional' },
    ],
    objectives: [
      'Representar a concesionarias y agencias frente a organismos publicos y privados.',
      'Impulsar capacitacion continua en gestion comercial y regulatoria.',
      'Canalizar informacion tecnica, normativa y comercial para la toma de decisiones.',
    ],
    benefits: [
      'Asistencia institucional en tramites y consultas sectoriales.',
      'Programas de formacion con agenda anual.',
      'Red colaborativa con foco regional.',
    ],
  },
  landing: {
    badge: 'CÁMARA DE REPARACIÓN DE AUTOMOTORES',
    title: 'Cámara de Reparación de Automotores de Bahía Blanca',
    description:
      'Una institucion enfocada en representar, capacitar y potenciar al entramado automotor regional con una agenda profesional y sustentable.',
    primary_cta: { label: 'Conocer servicios', url: '#servicios' },
    secondary_cta: { label: 'Contacto institucional', url: '#contacto' },
    image_url: '',
    image_alt: 'Imagen institucional de CRABB',
    values: ['Trabajo conjunto', 'Profesionalismo', 'Cercania', 'Compromiso regional'],
    visual: {
      title: 'Sector automotor regional',
      description: 'Representacion, gestion y formacion para empresas del ecosistema automotor.',
      items: ['Representacion institucional', 'Gestion y asesoramiento', 'Capacitacion continua'],
      region_label: 'Bahia Blanca y region',
    },
    services: [
      {
        title: 'Representacion y Gestion',
        description: 'Defendemos los intereses del sector ante organismos publicos y privados.',
        cta_label: 'Mas informacion',
        cta_href: '/institucional',
        icon: 'representacion',
        order: 1,
        visible: true,
      },
      {
        title: 'Capacitacion Continua',
        description: 'Formacion profesional de calidad para potenciar personas y empresas.',
        cta_label: 'Ver capacitaciones',
        cta_href: TRAINING_EXTERNAL_URL,
        icon: 'capacitacion',
        order: 2,
        visible: true,
      },
      {
        title: 'Informacion y Data Tecnica',
        description: 'Accede a informacion actualizada para tomar mejores decisiones.',
        cta_label: 'Explorar data tecnica',
        cta_href: '/data-tecnica',
        icon: 'data',
        order: 3,
        visible: true,
      },
      {
        title: 'Red y Beneficios',
        description: 'Descuentos, convenios y una red de contactos que genera valor.',
        cta_label: 'Conoce los beneficios',
        cta_href: '/contacto',
        icon: 'red',
        order: 4,
        visible: true,
      },
    ],
    campaign: {
      title: 'Campana de inscripcion',
      description: 'Nuevos cupos para empresas y profesionales vinculados al ecosistema automotor regional.',
      items: ['Alta institucional simplificada', 'Acompanamiento en el proceso', 'Agenda inicial de beneficios'],
      cta: { label: 'Iniciar inscripcion', url: '#contacto' },
    },
    data_technical: {
      title: 'Data Tecnica',
      description: 'Compendio tecnico y regulatorio para acompanar decisiones operativas en tiempo real.',
      items: ['Boletines normativos', 'Fichas tecnicas del sector', 'Alertas de actualizacion'],
    },
    trainings: {
      title: 'Capacitaciones',
      description: 'Cronograma anual con foco en profesionalizacion y actualizacion continua.',
      items: ['Talleres de gestion comercial', 'Formacion legal y tributaria', 'Entrenamientos operativos'],
    },
    assistance: {
      title: 'CRABB Auxilio',
      description: 'Canal de acompanamiento para dudas operativas frecuentes y casos urgentes del sector.',
      items: ['Asesoramiento inicial', 'Derivacion especializada', 'Seguimiento de casos'],
    },
    opportunities: {
      title: 'Nuevas Oportunidades',
      description: 'Espacio para detectar alianzas, iniciativas y proyectos de crecimiento regional.',
      items: ['Rondas de negocios', 'Nuevos convenios', 'Networking sectorial'],
    },
    final_cta: {
      title: 'Sumate a la comunidad CRABB',
      description:
        'Participa de una red institucional que integra representacion, informacion confiable y desarrollo profesional.',
      primary_cta: { label: 'Solicitar asesoramiento', url: '#contacto' },
      secondary_cta: { label: 'Ver institucional', url: '/institucional' },
    },
  },
  contact: {
    address: 'Bahia Blanca, Buenos Aires, Argentina',
    email: 'institucional@crabb.org.ar',
    phone: '+54 291 000 0000',
    hours: 'Lunes a viernes de 9:00 a 17:00',
  },
  social_links: [
    { platform: 'LinkedIn', url: 'https://www.linkedin.com' },
    { platform: 'Instagram', url: 'https://www.instagram.com' },
    { platform: 'YouTube', url: 'https://www.youtube.com' },
  ],
  footer: {
    copyright: 'CRABB - Camara Regional Automotor de Bahia Blanca',
    description: 'Representacion institucional automotor con alcance regional.',
    legal_links: [
      { label: 'Privacidad', url: '/privacidad' },
      { label: 'Términos', url: '/terminos' },
      { label: 'Eliminación de datos', url: '/eliminacion-de-datos' },
    ],
  },
  visibility: {
    show_authorities: true,
    show_objectives: true,
    show_benefits: true,
    show_contact: true,
    show_social_links: true,
    show_members_summary: false,
    show_fees_summary: false,
  },
}

function hasText(value: string | undefined | null): boolean {
  return Boolean(value && value.trim().length > 0)
}

function mergeString(apiValue: string, fallbackValue: string): string {
  return hasText(apiValue) ? apiValue : fallbackValue
}

function mergeActionLink(apiLink: ActionLink, fallbackLink: ActionLink): ActionLink {
  return {
    label: mergeString(apiLink.label, fallbackLink.label),
    url: mergeString(apiLink.url, fallbackLink.url),
  }
}

function hasAuthorityData(authority: InstitutionalAuthority): boolean {
  return hasText(authority.role) || hasText(authority.name)
}

function mergeAuthorities(apiAuthorities: InstitutionalAuthority[], fallbackAuthorities: InstitutionalAuthority[]) {
  const validAuthorities = apiAuthorities.filter(hasAuthorityData)
  return validAuthorities.length > 0 ? validAuthorities : fallbackAuthorities
}

function mergeStringList(apiList: string[], fallbackList: string[]): string[] {
  return apiList.length > 0 ? apiList : fallbackList
}

function mergeServices(apiServices: LandingService[], fallbackServices: LandingService[]): LandingService[] {
  const validServices = apiServices.filter((item) => hasText(item.title) || hasText(item.description))
  return validServices.length > 0 ? validServices : fallbackServices
}

function mergeLandingSection(apiSection: LandingSection, fallbackSection: LandingSection): LandingSection {
  return {
    title: mergeString(apiSection.title, fallbackSection.title),
    description: mergeString(apiSection.description, fallbackSection.description),
    items: mergeStringList(apiSection.items, fallbackSection.items),
  }
}

function mergeAbout(apiAbout: LandingAbout | undefined, fallbackAbout: LandingAbout): LandingAbout {
  return {
    eyebrow: mergeString(apiAbout?.eyebrow ?? '', fallbackAbout.eyebrow),
    title: mergeString(apiAbout?.title ?? '', fallbackAbout.title),
    description: mergeString(apiAbout?.description ?? '', fallbackAbout.description),
    body: mergeString(apiAbout?.body ?? '', fallbackAbout.body),
    image_url: mergeString(apiAbout?.image_url ?? '', fallbackAbout.image_url ?? ''),
    image_alt: mergeString(apiAbout?.image_alt ?? '', fallbackAbout.image_alt ?? ''),
    visible: apiAbout?.visible !== false,
  }
}

function mergeNavigation(
  apiNavigation: LandingNavigation | undefined,
  fallbackNavigation: LandingNavigation,
): LandingNavigation {
  const apiItems = (apiNavigation?.items ?? []).filter((item) => hasText(item.label) && hasText(item.url))

  return {
    brand_eyebrow: mergeString(apiNavigation?.brand_eyebrow ?? '', fallbackNavigation.brand_eyebrow),
    brand_name: mergeString(apiNavigation?.brand_name ?? '', fallbackNavigation.brand_name),
    logo_url: mergeString(apiNavigation?.logo_url ?? '', fallbackNavigation.logo_url ?? ''),
    items: apiItems.length > 0 ? apiItems : fallbackNavigation.items,
  }
}

function mergeHeroVisual(
  apiVisual: InstitutionalContent['landing']['hero']['visual'],
  fallbackVisual: InstitutionalContent['landing']['hero']['visual'],
) {
  return {
    title: mergeString(apiVisual?.title ?? '', fallbackVisual?.title ?? ''),
    description: mergeString(apiVisual?.description ?? '', fallbackVisual?.description ?? ''),
    items: mergeStringList(apiVisual?.items ?? [], fallbackVisual?.items ?? []),
    region_label: mergeString(apiVisual?.region_label ?? '', fallbackVisual?.region_label ?? ''),
  }
}

export function mapPreviewContractToInstitutionalContent(
  preview: InstitutionalPreviewContract,
): InstitutionalContent {
  return {
    institutional_page: {
      title: preview.institutional_page.title,
      description: preview.institutional_page.description,
      authorities: preview.institutional_page.authorities,
      objectives: preview.institutional_page.objectives,
      benefits: preview.institutional_page.benefits,
      members_summary: undefined,
      fees_summary: undefined,
    },
    landing: {
      hero: {
        badge: preview.landing.badge,
        title: preview.landing.title,
        subtitle: '',
        description: preview.landing.description,
        primary_cta: preview.landing.primary_cta,
        secondary_cta: preview.landing.secondary_cta,
        image_url: preview.landing.image_url,
        image_alt: preview.landing.image_alt,
        values: preview.landing.values,
        visual: preview.landing.visual,
      },
      navigation: {
        brand_eyebrow: 'CÁMARA DE REPARACIÓN DE AUTOMOTORES',
        brand_name: 'Bahía Blanca',
        logo_url: '',
        items: [
          { label: 'Inicio', url: '#inicio', order: 1, visible: true },
          { label: 'Nosotros', url: '#sobre-nosotros', order: 2, visible: true },
          { label: 'Servicios', url: '#servicios', order: 3, visible: true },
          { label: 'Institucional', url: '/institucional', order: 4, visible: true },
          { label: 'Contacto', url: '#contacto', order: 5, visible: true },
        ],
      },
      about: {
        eyebrow: 'Nosotros',
        title: 'Sobre CRABB',
        description: 'Una institución regional que representa, acompaña y fortalece al sector automotor.',
        body: 'CRABB trabaja junto a talleres, comercios y profesionales vinculados al rubro automotor, promoviendo la capacitación, la información técnica, la gestión institucional y la vinculación entre socios de Bahía Blanca y la región.',
        image_url: '',
        image_alt: 'Institucional CRABB — sector automotor regional',
        visible: true,
      },
      services: preview.landing.services,
      campaign: {
        ...preview.landing.campaign,
      },
      data_tecnica: {
        ...preview.landing.data_technical,
      },
      capacitaciones: {
        ...preview.landing.trainings,
      },
      crabb_auxilio: {
        ...preview.landing.assistance,
      },
      opportunities: {
        ...preview.landing.opportunities,
      },
      final_cta: {
        ...preview.landing.final_cta,
      },
    },
    contact: {
      ...preview.contact,
    },
    social_links: preview.social_links,
    footer: {
      copyright: preview.footer.copyright,
      description: preview.footer.description,
    },
    visibility: {
      show_authorities: preview.visibility.show_authorities ?? true,
      show_objectives: preview.visibility.show_objectives ?? true,
      show_benefits: preview.visibility.show_benefits ?? true,
      show_contact: preview.visibility.show_contact ?? true,
      show_social_links: preview.visibility.show_social_links ?? true,
      show_members_summary: preview.visibility.show_members_summary ?? false,
      show_fees_summary: preview.visibility.show_fees_summary ?? false,
    },
  }
}

export const institutionalPreviewContent = mapPreviewContractToInstitutionalContent(institutionalPreviewData)

export const institutionalPreviewFooterLinkGroups = [
  {
    title: 'Links rapidos',
    links: [
      { label: 'Inicio', url: '#inicio' },
      { label: 'Institucional', url: '/institucional' },
      { label: 'Contacto', url: '#contacto' },
    ],
  },
  {
    title: 'Servicios',
    links: [
      { label: 'Representacion', url: '#servicios' },
      { label: 'Capacitaciones', url: TRAINING_EXTERNAL_URL },
      { label: 'Data tecnica', url: '#data-tecnica' },
    ],
  },
  {
    title: 'Legal',
    links: institutionalPreviewData.footer.legal_links,
  },
]

export function getInstitutionalContentWithFallback(
  apiContent: InstitutionalContent | null | undefined,
): InstitutionalContent {
  // Fallback visual temporal para diseno: preserva API real cuando hay datos y completa campos faltantes.
  if (!apiContent) return institutionalPreviewContent

  const fallback = institutionalPreviewContent

  const hasApiMembersSummary =
    apiContent.institutional_page.members_summary !== undefined &&
    (apiContent.institutional_page.members_summary.total > 0 ||
      hasText(apiContent.institutional_page.members_summary.label))

  const hasApiFeesSummary =
    apiContent.institutional_page.fees_summary !== undefined &&
    (hasText(apiContent.institutional_page.fees_summary.title) ||
      hasText(apiContent.institutional_page.fees_summary.description))

  const validSocialLinks = apiContent.social_links.filter((item) => hasText(item.platform) && hasText(item.url))

  return {
    institutional_page: {
      title: mergeString(apiContent.institutional_page.title, fallback.institutional_page.title),
      description: mergeString(
        apiContent.institutional_page.description,
        fallback.institutional_page.description,
      ),
      authorities: mergeAuthorities(
        apiContent.institutional_page.authorities,
        fallback.institutional_page.authorities,
      ),
      objectives: mergeStringList(
        apiContent.institutional_page.objectives,
        fallback.institutional_page.objectives,
      ),
      benefits: mergeStringList(apiContent.institutional_page.benefits, fallback.institutional_page.benefits),
      members_summary: hasApiMembersSummary ? apiContent.institutional_page.members_summary : undefined,
      fees_summary: hasApiFeesSummary ? apiContent.institutional_page.fees_summary : undefined,
    },
    landing: {
      hero: {
        badge: mergeString(apiContent.landing.hero.badge, fallback.landing.hero.badge),
        title: mergeString(apiContent.landing.hero.title, fallback.landing.hero.title),
        subtitle: mergeString(apiContent.landing.hero.subtitle, fallback.landing.hero.subtitle),
        description: mergeString(apiContent.landing.hero.description, fallback.landing.hero.description),
        primary_cta: mergeActionLink(apiContent.landing.hero.primary_cta, fallback.landing.hero.primary_cta),
        secondary_cta: mergeActionLink(
          apiContent.landing.hero.secondary_cta,
          fallback.landing.hero.secondary_cta,
        ),
        image_url: mergeString(apiContent.landing.hero.image_url ?? '', fallback.landing.hero.image_url ?? ''),
        image_alt: mergeString(
          apiContent.landing.hero.image_alt ?? '',
          fallback.landing.hero.image_alt ?? '',
        ),
        values: mergeStringList(apiContent.landing.hero.values ?? [], fallback.landing.hero.values ?? []),
        visual: mergeHeroVisual(apiContent.landing.hero.visual, fallback.landing.hero.visual),
      },
      navigation: mergeNavigation(apiContent.landing.navigation, fallback.landing.navigation),
      about: mergeAbout(apiContent.landing.about, fallback.landing.about),
      services: mergeServices(apiContent.landing.services, fallback.landing.services),
      campaign: {
        ...mergeLandingSection(apiContent.landing.campaign, fallback.landing.campaign),
        cta: mergeActionLink(apiContent.landing.campaign.cta, fallback.landing.campaign.cta),
      },
      data_tecnica: mergeLandingSection(apiContent.landing.data_tecnica, fallback.landing.data_tecnica),
      capacitaciones: mergeLandingSection(apiContent.landing.capacitaciones, fallback.landing.capacitaciones),
      crabb_auxilio: mergeLandingSection(apiContent.landing.crabb_auxilio, fallback.landing.crabb_auxilio),
      opportunities: mergeLandingSection(apiContent.landing.opportunities, fallback.landing.opportunities),
      final_cta: {
        title: mergeString(apiContent.landing.final_cta.title, fallback.landing.final_cta.title),
        description: mergeString(
          apiContent.landing.final_cta.description,
          fallback.landing.final_cta.description,
        ),
        primary_cta: mergeActionLink(
          apiContent.landing.final_cta.primary_cta,
          fallback.landing.final_cta.primary_cta,
        ),
        secondary_cta: mergeActionLink(
          apiContent.landing.final_cta.secondary_cta,
          fallback.landing.final_cta.secondary_cta,
        ),
      },
    },
    contact: {
      address: mergeString(apiContent.contact.address, fallback.contact.address),
      email: mergeString(apiContent.contact.email, fallback.contact.email),
      phone: mergeString(apiContent.contact.phone, fallback.contact.phone),
      hours: mergeString(apiContent.contact.hours, fallback.contact.hours),
    },
    social_links: validSocialLinks.length > 0 ? validSocialLinks : fallback.social_links,
    footer: {
      copyright: mergeString(apiContent.footer.copyright, fallback.footer.copyright),
      description: mergeString(apiContent.footer.description, fallback.footer.description),
      legal_links: apiContent.footer.legal_links,
    },
    visibility: {
      ...fallback.visibility,
      ...apiContent.visibility,
    },
  }
}
