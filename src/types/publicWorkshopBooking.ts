/**
 * Refleja exactamente `PublicTallerResponseDto` de tallerok-api
 * (src/talleres/dto/public-taller.dto.ts) — sin `descripcion` porque el
 * backend no la expone públicamente. No agregar campos que el backend no
 * devuelve.
 */
export type PublicWorkshop = {
  slug: string
  nombre: string
  telefono: string
  direccion: string
  rubro: string
  logoUrl: string | null
  colorPrimario: string | null
}

export type WorkshopStatus = 'loading' | 'found' | 'not-found' | 'error'

export type PublicWorkshopService = {
  id: string
  nombre: string
  descripcion?: string | null
}

/** Refleja `getDisponibilidadPublica` de tallerok-api (turnos.service.ts). */
export type PublicWorkshopTimeSlot = {
  start: string
  end: string
}

export type TimeSlotsStatus = 'idle' | 'loading' | 'empty' | 'ready' | 'error'

export type PublicWorkshopClientFormData = {
  nombreApellido: string
  telefono: string
  email: string
  patente: string
  marcaModelo: string
  motivo: string
  comentarios: string
}

export const EMPTY_CLIENT_FORM_DATA: PublicWorkshopClientFormData = {
  nombreApellido: '',
  telefono: '',
  email: '',
  patente: '',
  marcaModelo: '',
  motivo: '',
  comentarios: '',
}
