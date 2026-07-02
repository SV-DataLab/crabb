import type { ActionLink } from '../../types/institutional'

export const TRAINING_EXTERNAL_URL = 'https://faatra.org.ar/capacitaciones/snit'

export const LANDING_IMAGES = {
  heroWorkshop: '/images/landing/hero-workshop.jpg',
  aboutCrabb: '/images/landing/about-crabb.jpg',
  training: '/images/landing/training.jpg',
  technicalData: '/images/landing/technical-data.jpg',
} as const

export const ABOUT_CRABB_TEXT =
  'CRABB acompaña, representa y fortalece al sector automotor regional, articulando servicios, capacitación, información técnica y gestión institucional para socios, talleres y comercios vinculados al rubro.'

export type LandingStat = {
  label: string
  value: string
}

export const DEFAULT_LANDING_STATS: LandingStat[] = [
  { label: 'Socios activos', value: '120+' },
  { label: 'Años de trayectoria', value: '40+' },
  { label: 'Capacitaciones', value: '12 / año' },
  { label: 'Alcance regional', value: 'Sur bonaerense' },
]

export type ServiceCardData = {
  key: string
  title: string
  description: string
  icon: 'institution' | 'training' | 'data' | 'members' | 'comms' | 'network'
  cta?: ActionLink
}

export const LANDING_SERVICES: ServiceCardData[] = [
  {
    key: 'representacion',
    title: 'Representación institucional',
    description:
      'Defensa de intereses del sector ante organismos públicos, privados y espacios de articulación regional.',
    icon: 'institution',
    cta: { label: 'Conocer más', url: '/institucional' },
  },
  {
    key: 'capacitaciones',
    title: 'Capacitaciones',
    description:
      'Programas de formación para talleres y equipos, con foco en gestión, operación y actualización técnica.',
    icon: 'training',
    cta: { label: 'Ver capacitaciones', url: '#capacitaciones' },
  },
  {
    key: 'data-tecnica',
    title: 'Data técnica',
    description:
      'Acceso a documentación, normativas y recursos técnicos para decisiones operativas informadas.',
    icon: 'data',
    cta: { label: 'Explorar data', url: '#data-tecnica' },
  },
  {
    key: 'gestion-socios',
    title: 'Gestión para socios',
    description:
      'Herramientas de seguimiento societario, cuotas y comunicación institucional para socios activos.',
    icon: 'members',
    cta: { label: 'Ingresar al panel', url: '/login' },
  },
  {
    key: 'comunicacion',
    title: 'Comunicación y novedades',
    description:
      'Canales para difundir alertas, convocatorias y novedades relevantes del ecosistema automotor.',
    icon: 'comms',
    cta: { label: 'Ver agenda', url: '#novedades' },
  },
  {
    key: 'vinculacion',
    title: 'Vinculación sectorial',
    description:
      'Red de talleres, comercios y profesionales para generar oportunidades y trabajo conjunto.',
    icon: 'network',
    cta: { label: 'Consultar asociación', url: '#contacto' },
  },
]

export const MEMBER_BENEFITS = [
  'Acceso a información institucional',
  'Capacitaciones y actividades',
  'Comunicación directa',
  'Gestión de cuotas y estado societario',
  'Participación en una red regional',
]

export type TrainingPreviewCard = {
  key: string
  title: string
  tag: string
  date: string
  description: string
}

export const TRAINING_PREVIEW_CARDS: TrainingPreviewCard[] = [
  {
    key: 'diagnostico',
    title: 'Diagnóstico automotor',
    tag: 'Técnica',
    date: 'Próxima convocatoria',
    description: 'Actualización en sistemas de diagnóstico, lectura de fallas y buenas prácticas en taller.',
  },
  {
    key: 'tecnologias',
    title: 'Nuevas tecnologías',
    tag: 'Innovación',
    date: 'Agenda 2026',
    description: 'Electrificación, ADAS y tendencias que impactan la reparación y el servicio postventa.',
  },
  {
    key: 'gestion',
    title: 'Gestión de talleres',
    tag: 'Gestión',
    date: 'Modalidad presencial',
    description: 'Herramientas comerciales, legal-tributarias y operativas para fortalecer la gestión diaria.',
  },
]

export const TECHNICAL_DATA_CARDS = [
  {
    key: 'manuales',
    title: 'Manuales y documentación',
    description: 'Fichas, instructivos y material de referencia para el día a día del taller.',
  },
  {
    key: 'normativas',
    title: 'Normativas',
    description: 'Boletines y actualizaciones regulatorias del sector automotor.',
  },
  {
    key: 'recomendaciones',
    title: 'Recomendaciones técnicas',
    description: 'Buenas prácticas y criterios técnicos para intervenciones seguras.',
  },
  {
    key: 'recursos',
    title: 'Recursos descargables',
    description: 'Material complementario para consulta y capacitación interna.',
  },
]

export type NewsItem = {
  key: string
  title: string
  date: string
  category: string
  excerpt: string
}

export const NEWS_AGENDA_ITEMS: NewsItem[] = [
  {
    key: 'jornada',
    title: 'Jornada institucional del sector automotor',
    date: 'Mar 2026',
    category: 'Agenda',
    excerpt: 'Encuentro regional para socios, referentes técnicos y actores del ecosistema automotor.',
  },
  {
    key: 'capacitacion',
    title: 'Nueva convocatoria de capacitación abierta',
    date: 'Abr 2026',
    category: 'Capacitación',
    excerpt: 'Programa orientado a diagnóstico, gestión de talleres y actualización normativa.',
  },
  {
    key: 'data',
    title: 'Actualización de recursos en Data Técnica',
    date: 'May 2026',
    category: 'Data Técnica',
    excerpt: 'Incorporación de documentación técnica y alertas para socios y talleres adheridos.',
  },
]
