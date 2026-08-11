export type InstitutionalAuthority = {
  role: string
  name: string
}

export type InstitutionalMembersSummary = {
  total: number
  label: string
}

export type InstitutionalFeesSummary = {
  title: string
  description: string
}

export type InstitutionalVisibility = {
  show_authorities: boolean
  show_objectives: boolean
  show_benefits: boolean
  show_contact: boolean
  show_social_links: boolean
  show_members_summary: boolean
  show_fees_summary: boolean
}

export type InstitutionalPageContent = {
  title: string
  description: string
  authorities: InstitutionalAuthority[]
  objectives: string[]
  members_summary?: InstitutionalMembersSummary
  fees_summary?: InstitutionalFeesSummary
  benefits: string[]
}

export type ActionLink = {
  label: string
  url: string
}

export type LandingHeroVisual = {
  title?: string
  description?: string
  items?: string[]
  region_label?: string
}

export type LandingHero = {
  badge: string
  title: string
  subtitle: string
  description: string
  primary_cta: ActionLink
  secondary_cta: ActionLink
  image_url?: string
  image_alt?: string
  values?: string[]
  visual?: LandingHeroVisual
}

export type LandingService = {
  title: string
  description: string
  cta_label?: string
  cta_href?: string
  icon?: 'representacion' | 'capacitacion' | 'data' | 'red'
  order?: number
  visible?: boolean
}

export type LandingSection = {
  title: string
  description: string
  items: string[]
}

export type LandingCampaignSection = LandingSection & {
  cta: ActionLink
}

export type LandingFinalCta = {
  title: string
  description: string
  primary_cta: ActionLink
  secondary_cta: ActionLink
}

export type LandingAbout = {
  eyebrow: string
  title: string
  description: string
  body: string
  image_url?: string
  image_alt?: string
  visible?: boolean
}

export type LandingNavItem = {
  label: string
  url: string
  order?: number
  visible?: boolean
}

export type LandingNavigation = {
  brand_eyebrow: string
  brand_name: string
  logo_url?: string
  items: LandingNavItem[]
}

export type LandingContent = {
  hero: LandingHero
  navigation: LandingNavigation
  about: LandingAbout
  services: LandingService[]
  campaign: LandingCampaignSection
  data_tecnica: LandingSection
  capacitaciones: LandingSection
  crabb_auxilio: LandingSection
  opportunities: LandingSection
  final_cta: LandingFinalCta
}

export type InstitutionalContact = {
  address: string
  email: string
  phone: string
  hours: string
}

export type SocialLink = {
  platform: string
  label?: string
  url: string
  order?: number
  visible?: boolean
}

export type FooterLegalLink = {
  label: string
  url: string
  order?: number
  visible?: boolean
}

export type FooterContent = {
  copyright: string
  description: string
  /** Alias opcional devuelto por backend (`legal_links`). */
  legal_links?: FooterLegalLink[]
}

export type InstitutionalContent = {
  institutional_page: InstitutionalPageContent
  landing: LandingContent
  contact: InstitutionalContact
  social_links: SocialLink[]
  footer: FooterContent
  visibility: InstitutionalVisibility
}

export type InstitutionalUpdatePayload = InstitutionalContent

export type InstitutionalPartialUpdate = {
  institutional_page?: InstitutionalPageContent
  landing?: Partial<LandingContent> & Record<string, unknown>
  contact?: InstitutionalContact
  social_links?: SocialLink[]
  footer?: FooterContent
  visibility?: Partial<InstitutionalVisibility>
}
