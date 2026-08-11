import { apiRequest } from '../lib/apiClient'
import type {
  ActionLink,
  FooterContent,
  InstitutionalAuthority,
  InstitutionalContent,
  InstitutionalContact,
  InstitutionalFeesSummary,
  InstitutionalMembersSummary,
  InstitutionalPageContent,
  InstitutionalUpdatePayload,
  InstitutionalVisibility,
  InstitutionalPartialUpdate,
  LandingAbout,
  LandingCampaignSection,
  LandingContent,
  LandingFinalCta,
  LandingHero,
  LandingNavigation,
  LandingNavItem,
  LandingSection,
  LandingService,
  SocialLink,
} from '../types/institutional'

type UnknownObject = Record<string, unknown>

type BackendLegalLink = {
  label: string
  url: string
  order?: number
  visible?: boolean
}

type BackendInstitutionalPayload = UnknownObject & {
  landing: UnknownObject & {
    intro?: UnknownObject
    membership_campaign?: UnknownObject
    technical_data?: UnknownObject
    training?: UnknownObject
    auxilio?: UnknownObject
    final_cta?: UnknownObject
    services?: LandingService[]
    service_cards?: Array<{ title: string; description: string }>
  }
  footer?: UnknownObject & {
    legal_links?: BackendLegalLink[]
  }
}

function asObject(value: unknown): UnknownObject {
  if (value && typeof value === 'object') {
    return value as UnknownObject
  }
  return {}
}

function asString(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

function asNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function asOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function safeString(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

function hasNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

function sectionHasContent(section: UnknownObject): boolean {
  const items = section.items
  const hasItems = Array.isArray(items) && items.some((item) => hasNonEmptyString(asString(item)))

  return hasNonEmptyString(section.title) || hasNonEmptyString(section.description) || hasItems
}

/** Backend gana si trae contenido real; si no, se usa el alias frontend ya presente. */
function pickSectionByContent(frontendAlias: unknown, backendAlias: unknown): unknown {
  const backend = asObject(backendAlias)
  const frontend = asObject(frontendAlias)

  if (sectionHasContent(backend)) return backendAlias
  if (sectionHasContent(frontend)) return frontendAlias

  if (Object.keys(backend).length > 0) return backendAlias
  if (Object.keys(frontend).length > 0) return frontendAlias

  return {}
}

function emptyLandingSection(): UnknownObject {
  return { title: '', description: '', items: [] }
}

function mergeHeroFromBackend(heroRaw: unknown, introRaw: unknown): UnknownObject {
  const hero = { ...asObject(heroRaw) }
  const intro = asObject(introRaw)

  if (!hasNonEmptyString(hero.title) && hasNonEmptyString(intro.title)) {
    hero.title = intro.title
  }

  if (!hasNonEmptyString(hero.description) && hasNonEmptyString(intro.description)) {
    hero.description = intro.description
  }

  if (!hasNonEmptyString(hero.badge) && hasNonEmptyString(intro.badge)) {
    hero.badge = intro.badge
  }

  if (!hasNonEmptyString(hero.subtitle) && hasNonEmptyString(intro.subtitle)) {
    hero.subtitle = intro.subtitle
  }

  const heroPrimary = asObject(hero.primary_cta)
  const introPrimary = asObject(intro.primary_cta)
  if (
    !hasNonEmptyString(heroPrimary.label) &&
    !hasNonEmptyString(heroPrimary.url) &&
    (hasNonEmptyString(introPrimary.label) || hasNonEmptyString(introPrimary.url))
  ) {
    hero.primary_cta = intro.primary_cta
  }

  const heroSecondary = asObject(hero.secondary_cta)
  const introSecondary = asObject(intro.secondary_cta)
  if (
    !hasNonEmptyString(heroSecondary.label) &&
    !hasNonEmptyString(heroSecondary.url) &&
    (hasNonEmptyString(introSecondary.label) || hasNonEmptyString(introSecondary.url))
  ) {
    hero.secondary_cta = intro.secondary_cta
  }

  return hero
}

/** Traduce claves backend → contrato frontend estable antes de normalizar. */
function fromBackendLanding(raw: unknown): UnknownObject {
  const source = asObject(raw)

  const campaign = pickSectionByContent(source.campaign, source.membership_campaign)
  const data_tecnica = pickSectionByContent(source.data_tecnica, source.technical_data)
  const capacitaciones = pickSectionByContent(source.capacitaciones, source.training)
  const crabb_auxilio = pickSectionByContent(source.crabb_auxilio, source.auxilio)

  const opportunities = Object.prototype.hasOwnProperty.call(source, 'opportunities')
    ? source.opportunities
    : emptyLandingSection()

  return {
    ...source,
    hero: mergeHeroFromBackend(source.hero, source.intro),
    campaign,
    data_tecnica,
    capacitaciones,
    crabb_auxilio,
    opportunities,
  }
}

function normalizeActionLinkWithFlatCta(
  source: UnknownObject,
  flatKeys: { label: string; url: string },
): ActionLink {
  const fromObject = normalizeActionLink(source.cta ?? source.primary_cta)
  if (hasNonEmptyString(fromObject.label) || hasNonEmptyString(fromObject.url)) {
    return fromObject
  }

  const fromFlat: ActionLink = {
    label: asString(source[flatKeys.label]),
    url: asString(source[flatKeys.url]),
  }

  if (hasNonEmptyString(fromFlat.label) || hasNonEmptyString(fromFlat.url)) {
    return fromFlat
  }

  return fromObject
}

function toBackendLegalLinks(legalLinks: unknown): BackendLegalLink[] {
  if (!Array.isArray(legalLinks)) {
    return [
      { label: 'Términos y condiciones', url: '/terminos' },
      { label: 'Política de privacidad', url: '/privacidad' },
    ]
  }

  const normalizedLinks = legalLinks
    .map((item) => {
      const source = asObject(item)
      return {
        label: safeString(source.label),
        url: safeString(source.url ?? source.href),
        order: asOptionalNumber(source.order),
        visible: Object.prototype.hasOwnProperty.call(source, 'visible')
          ? asBoolean(source.visible, true)
          : undefined,
      }
    })
    .filter((item) => item.label && item.url)

  if (normalizedLinks.length > 0) return normalizedLinks

  return [
    { label: 'Términos y condiciones', url: '/terminos' },
    { label: 'Política de privacidad', url: '/privacidad' },
  ]
}

function toBackendLandingSection(section: LandingSection): UnknownObject {
  return {
    title: safeString(section.title),
    description: safeString(section.description),
    items: section.items,
  }
}

function toBackendLandingCampaign(section: LandingCampaignSection): UnknownObject {
  return {
    ...toBackendLandingSection(section),
    cta: {
      label: safeString(section.cta.label),
      url: safeString(section.cta.url),
    },
    cta_label: safeString(section.cta.label),
    cta_url: safeString(section.cta.url),
  }
}

function toBackendInstitutionalPayload(content: InstitutionalContent): BackendInstitutionalPayload {
  const campaign = content.landing.campaign
  const dataTecnica = content.landing.data_tecnica
  const capacitaciones = content.landing.capacitaciones
  const crabbAuxilio = content.landing.crabb_auxilio
  const opportunities = content.landing.opportunities
  const finalCta = content.landing.final_cta

  const membershipCampaign = toBackendLandingCampaign(campaign)
  const technicalData = toBackendLandingSection(dataTecnica)
  const training = toBackendLandingSection(capacitaciones)
  const auxilio = toBackendLandingSection(crabbAuxilio)
  const opportunitiesPayload = toBackendLandingSection(opportunities)

  const serviceCards = content.landing.services.map((service) => ({
    title: safeString(service.title),
    description: safeString(service.description),
  }))

  const intro = {
    title: safeString(content.landing.hero.title),
    description: safeString(content.landing.hero.description),
    badge: safeString(content.landing.hero.badge),
    subtitle: safeString(content.landing.hero.subtitle),
    primary_cta: content.landing.hero.primary_cta,
    secondary_cta: content.landing.hero.secondary_cta,
  }

  const finalCtaPayload = {
    title: safeString(finalCta.title),
    description: safeString(finalCta.description),
    cta_label: safeString(finalCta.primary_cta.label),
    cta_url: safeString(finalCta.primary_cta.url),
    primary_cta: { ...finalCta.primary_cta },
    secondary_cta: { ...finalCta.secondary_cta },
  }

  return {
    ...content,
    institutional_page: {
      ...content.institutional_page,
    },
    landing: {
      ...content.landing,
      hero: content.landing.hero,
      intro,
      membership_campaign: membershipCampaign,
      campaign: membershipCampaign,
      technical_data: technicalData,
      data_tecnica: technicalData,
      training,
      capacitaciones: training,
      auxilio,
      crabb_auxilio: auxilio,
      navigation: content.landing.navigation,
      about: content.landing.about,
      opportunities: opportunitiesPayload,
      final_cta: finalCtaPayload,
      services: content.landing.services.map((service) => ({
        ...service,
        title: safeString(service.title),
        description: safeString(service.description),
        cta_label: safeString(service.cta_label),
        cta_href: safeString(service.cta_href),
        visible: service.visible ?? true,
      })),
      service_cards: serviceCards,
    },
    footer: {
      ...content.footer,
      legal_links: toBackendLegalLinks(content.footer.legal_links),
    },
  }
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true' || normalized === '1') return true
    if (normalized === 'false' || normalized === '0') return false
  }
  return fallback
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => asString(item).trim()).filter(Boolean)
}

function normalizeActionLink(value: unknown): ActionLink {
  const source = asObject(value)
  return {
    label: asString(source.label),
    url: asString(source.url),
  }
}

function normalizeAuthority(value: unknown): InstitutionalAuthority {
  const source = asObject(value)
  return {
    role: asString(source.role),
    name: asString(source.name),
  }
}

function normalizeMembersSummary(value: unknown): InstitutionalMembersSummary {
  const source = asObject(value)
  return {
    total: asNumber(source.total),
    label: asString(source.label),
  }
}

function normalizeFeesSummary(value: unknown): InstitutionalFeesSummary {
  const source = asObject(value)
  return {
    title: asString(source.title),
    description: asString(source.description),
  }
}

function normalizeInstitutionalPage(value: unknown): InstitutionalPageContent {
  const source = asObject(value)
  const authoritiesRaw = source.authorities
  const hasMembersSummary = Object.prototype.hasOwnProperty.call(source, 'members_summary')
  const hasFeesSummary = Object.prototype.hasOwnProperty.call(source, 'fees_summary')

  return {
    title: asString(source.title),
    description: asString(source.description),
    authorities: Array.isArray(authoritiesRaw) ? authoritiesRaw.map(normalizeAuthority) : [],
    objectives: normalizeStringList(source.objectives),
    members_summary: hasMembersSummary ? normalizeMembersSummary(source.members_summary) : undefined,
    fees_summary: hasFeesSummary ? normalizeFeesSummary(source.fees_summary) : undefined,
    benefits: normalizeStringList(source.benefits),
  }
}

function normalizeLandingHero(value: unknown): LandingHero {
  const source = asObject(value)
  const visualSource = asObject(source.visual)
  return {
    badge: asString(source.badge),
    title: asString(source.title),
    subtitle: asString(source.subtitle),
    description: asString(source.description),
    primary_cta: normalizeActionLink(source.primary_cta),
    secondary_cta: normalizeActionLink(source.secondary_cta),
    image_url: asString(source.image_url),
    image_alt: asString(source.image_alt),
    values: normalizeStringList(source.values),
    visual: {
      title: asString(visualSource.title),
      description: asString(visualSource.description),
      items: normalizeStringList(visualSource.items),
      region_label: asString(visualSource.region_label),
    },
  }
}

function normalizeLandingService(value: unknown): LandingService {
  const source = asObject(value)
  const normalizedIcon = asString(source.icon)
  const isValidIcon =
    normalizedIcon === 'representacion' ||
    normalizedIcon === 'capacitacion' ||
    normalizedIcon === 'data' ||
    normalizedIcon === 'red'

  return {
    title: asString(source.title),
    description: asString(source.description),
    cta_label: asString(source.cta_label),
    cta_href: asString(source.cta_href),
    icon: isValidIcon ? normalizedIcon : undefined,
    order: asOptionalNumber(source.order),
    visible: Object.prototype.hasOwnProperty.call(source, 'visible')
      ? asBoolean(source.visible, true)
      : undefined,
  }
}

function normalizeLandingSection(value: unknown): LandingSection {
  const source = asObject(value)
  return {
    title: asString(source.title),
    description: asString(source.description),
    items: normalizeStringList(source.items),
  }
}

function normalizeLandingCampaign(value: unknown): LandingCampaignSection {
  const source = asObject(value)
  return {
    ...normalizeLandingSection(source),
    cta: normalizeActionLinkWithFlatCta(source, { label: 'cta_label', url: 'cta_url' }),
  }
}

function normalizeLandingFinalCta(value: unknown): LandingFinalCta {
  const source = asObject(value)
  const primary_cta = normalizeActionLinkWithFlatCta(source, { label: 'cta_label', url: 'cta_url' })
  const secondary_cta = normalizeActionLink(source.secondary_cta)

  return {
    title: asString(source.title),
    description: asString(source.description),
    primary_cta,
    secondary_cta,
  }
}

function normalizeLandingAbout(value: unknown): LandingAbout {
  const source = asObject(value)
  return {
    eyebrow: asString(source.eyebrow),
    title: asString(source.title),
    description: asString(source.description),
    body: asString(source.body),
    image_url: asString(source.image_url),
    image_alt: asString(source.image_alt),
    visible: Object.prototype.hasOwnProperty.call(source, 'visible')
      ? asBoolean(source.visible, true)
      : true,
  }
}

function normalizeLandingNavItem(value: unknown, index = 0): LandingNavItem {
  const source = asObject(value)
  return {
    label: asString(source.label),
    url: asString(source.url ?? source.href),
    order: asOptionalNumber(source.order) ?? index + 1,
    visible: Object.prototype.hasOwnProperty.call(source, 'visible')
      ? asBoolean(source.visible, true)
      : true,
  }
}

function normalizeLandingNavigation(value: unknown): LandingNavigation {
  const source = asObject(value)
  const itemsRaw = source.items

  return {
    brand_eyebrow: asString(source.brand_eyebrow),
    brand_name: asString(source.brand_name),
    logo_url: asString(source.logo_url),
    items: Array.isArray(itemsRaw) ? itemsRaw.map((item, index) => normalizeLandingNavItem(item, index)) : [],
  }
}

function normalizeLanding(value: unknown): LandingContent {
  const source = fromBackendLanding(value)
  const servicesRaw = source.services
  const legacyServiceCardsRaw = source.service_cards

  return {
    hero: normalizeLandingHero(source.hero),
    navigation: normalizeLandingNavigation(source.navigation),
    about: normalizeLandingAbout(source.about),
    services: Array.isArray(servicesRaw)
      ? servicesRaw.map(normalizeLandingService)
      : Array.isArray(legacyServiceCardsRaw)
        ? legacyServiceCardsRaw.map(normalizeLandingService)
        : [],
    campaign: normalizeLandingCampaign(source.campaign),
    data_tecnica: normalizeLandingSection(source.data_tecnica),
    capacitaciones: normalizeLandingSection(source.capacitaciones),
    crabb_auxilio: normalizeLandingSection(source.crabb_auxilio),
    opportunities: normalizeLandingSection(source.opportunities),
    final_cta: normalizeLandingFinalCta(source.final_cta),
  }
}

function normalizeContact(value: unknown): InstitutionalContact {
  const source = asObject(value)
  return {
    address: asString(source.address),
    email: asString(source.email),
    phone: asString(source.phone),
    hours: asString(source.hours || source.schedule),
  }
}

function normalizeSocialLink(value: unknown, index = 0): SocialLink {
  const source = asObject(value)
  const platform = asString(source.platform) || asString(source.label)
  const label = asString(source.label)

  return {
    platform,
    label: label || undefined,
    url: asString(source.url),
    order: asOptionalNumber(source.order) ?? index + 1,
    visible: Object.prototype.hasOwnProperty.call(source, 'visible')
      ? asBoolean(source.visible, true)
      : true,
  }
}

function normalizeVisibility(value: unknown): InstitutionalVisibility {
  const source = asObject(value)
  return {
    show_authorities: asBoolean(source.show_authorities, true),
    show_objectives: asBoolean(source.show_objectives, true),
    show_benefits: asBoolean(source.show_benefits, true),
    show_contact: asBoolean(source.show_contact, true),
    show_social_links: asBoolean(source.show_social_links, true),
    show_members_summary: asBoolean(source.show_members_summary, false),
    show_fees_summary: asBoolean(source.show_fees_summary, false),
  }
}

function normalizeFooter(value: unknown): FooterContent {
  const source = asObject(value)
  const legalLinksRaw = source.legal_links

  return {
    copyright: asString(source.copyright),
    description: asString(source.description),
    legal_links: Array.isArray(legalLinksRaw)
      ? legalLinksRaw
          .map((item) => {
            const link = asObject(item)
            return {
              label: asString(link.label),
              url: asString(link.url ?? link.href),
              order: asOptionalNumber(link.order),
              visible: Object.prototype.hasOwnProperty.call(link, 'visible')
                ? asBoolean(link.visible, true)
                : undefined,
            }
          })
          .filter((item) => hasNonEmptyString(item.label) && hasNonEmptyString(item.url))
      : undefined,
  }
}

function normalizeInstitutionalContent(value: unknown): InstitutionalContent {
  const source = asObject(value)
  const socialLinksRaw = source.social_links

  return {
    institutional_page: normalizeInstitutionalPage(source.institutional_page),
    landing: normalizeLanding(source.landing),
    contact: normalizeContact(source.contact),
    social_links: Array.isArray(socialLinksRaw)
      ? socialLinksRaw.map((item, index) => normalizeSocialLink(item, index))
      : [],
    footer: normalizeFooter(source.footer),
    visibility: normalizeVisibility(source.visibility),
  }
}

function extractPayload(value: unknown): unknown {
  const root = asObject(value)
  if (root.data !== undefined) return root.data
  return value
}

export function createEmptyInstitutionalContent(): InstitutionalContent {
  return {
    institutional_page: {
      title: '',
      description: '',
      authorities: [],
      objectives: [],
      members_summary: undefined,
      fees_summary: undefined,
      benefits: [],
    },
    landing: {
      hero: {
        badge: '',
        title: '',
        subtitle: '',
        description: '',
        primary_cta: { label: '', url: '' },
        secondary_cta: { label: '', url: '' },
        image_url: '',
        image_alt: '',
        values: [],
        visual: {
          title: '',
          description: '',
          items: [],
          region_label: '',
        },
      },
      services: [],
      campaign: {
        title: '',
        description: '',
        items: [],
        cta: { label: '', url: '' },
      },
      data_tecnica: {
        title: '',
        description: '',
        items: [],
      },
      capacitaciones: {
        title: '',
        description: '',
        items: [],
      },
      crabb_auxilio: {
        title: '',
        description: '',
        items: [],
      },
      navigation: {
        brand_eyebrow: '',
        brand_name: '',
        logo_url: '',
        items: [],
      },
      about: {
        eyebrow: '',
        title: '',
        description: '',
        body: '',
        image_url: '',
        image_alt: '',
        visible: true,
      },
      opportunities: {
        title: '',
        description: '',
        items: [],
      },
      final_cta: {
        title: '',
        description: '',
        primary_cta: { label: '', url: '' },
        secondary_cta: { label: '', url: '' },
      },
    },
    contact: {
      address: '',
      email: '',
      phone: '',
      hours: '',
    },
    social_links: [],
    footer: {
      copyright: '',
      description: '',
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
}

function hasValue(value: string): boolean {
  return value.trim().length > 0
}

export function hasInstitutionalPageContent(content: InstitutionalContent): boolean {
  const section = content.institutional_page
  return (
    hasValue(section.title) ||
    hasValue(section.description) ||
    section.authorities.some((item) => hasValue(item.role) || hasValue(item.name)) ||
    section.objectives.length > 0 ||
    section.benefits.length > 0 ||
    (section.members_summary ? section.members_summary.total > 0 || hasValue(section.members_summary.label) : false) ||
    (section.fees_summary
      ? hasValue(section.fees_summary.title) || hasValue(section.fees_summary.description)
      : false)
  )
}

export function hasLandingContent(content: InstitutionalContent): boolean {
  const landing = content.landing
  return (
    hasValue(landing.hero.badge) ||
    hasValue(landing.hero.title) ||
    hasValue(landing.hero.subtitle) ||
    hasValue(landing.hero.description) ||
    hasValue(landing.hero.primary_cta.label) ||
    hasValue(landing.hero.primary_cta.url) ||
    hasValue(landing.hero.secondary_cta.label) ||
    hasValue(landing.hero.secondary_cta.url) ||
    hasValue(landing.hero.image_url ?? '') ||
    hasValue(landing.hero.image_alt ?? '') ||
    (landing.hero.values ?? []).length > 0 ||
    hasValue(landing.hero.visual?.title ?? '') ||
    hasValue(landing.hero.visual?.description ?? '') ||
    (landing.hero.visual?.items ?? []).length > 0 ||
    hasValue(landing.hero.visual?.region_label ?? '') ||
    landing.services.some((item) => hasValue(item.title) || hasValue(item.description)) ||
    hasValue(landing.campaign.title) ||
    hasValue(landing.campaign.description) ||
    landing.campaign.items.length > 0 ||
    hasValue(landing.campaign.cta.label) ||
    hasValue(landing.campaign.cta.url) ||
    hasValue(landing.data_tecnica.title) ||
    hasValue(landing.data_tecnica.description) ||
    landing.data_tecnica.items.length > 0 ||
    hasValue(landing.capacitaciones.title) ||
    hasValue(landing.capacitaciones.description) ||
    landing.capacitaciones.items.length > 0 ||
    hasValue(landing.crabb_auxilio.title) ||
    hasValue(landing.crabb_auxilio.description) ||
    landing.crabb_auxilio.items.length > 0 ||
    hasValue(landing.opportunities.title) ||
    hasValue(landing.opportunities.description) ||
    landing.opportunities.items.length > 0 ||
    hasValue(landing.final_cta.title) ||
    hasValue(landing.final_cta.description) ||
    hasValue(landing.final_cta.primary_cta.label) ||
    hasValue(landing.final_cta.primary_cta.url) ||
    hasValue(landing.final_cta.secondary_cta.label) ||
    hasValue(landing.final_cta.secondary_cta.url) ||
    hasValue(content.contact.address) ||
    hasValue(content.contact.email) ||
    hasValue(content.contact.phone) ||
    hasValue(content.contact.hours) ||
    content.social_links.some((item) => hasValue(item.platform) || hasValue(item.url)) ||
    hasValue(content.footer.copyright) ||
    hasValue(content.footer.description)
  )
}

export const institutionalService = {
  async getInstitutionalContent(): Promise<InstitutionalContent> {
    const response = await apiRequest<unknown>('/institutional')
    return normalizeInstitutionalContent(extractPayload(response))
  },

  async getAdminInstitutionalContent(): Promise<InstitutionalContent> {
    const response = await apiRequest<unknown>('/admin/institutional')
    return normalizeInstitutionalContent(extractPayload(response))
  },

  async updateInstitutionalContent(payload: InstitutionalUpdatePayload): Promise<InstitutionalContent> {
    const backendPayload = toBackendInstitutionalPayload(payload)
    const response = await apiRequest<unknown>('/admin/institutional', {
      method: 'PUT',
      body: backendPayload,
    })

    return normalizeInstitutionalContent(extractPayload(response))
  },

  async updateInstitutionalPartial(patch: InstitutionalPartialUpdate): Promise<InstitutionalContent> {
    const response = await apiRequest<unknown>('/admin/institutional', {
      method: 'PUT',
      body: patch,
    })

    return normalizeInstitutionalContent(extractPayload(response))
  },
}
