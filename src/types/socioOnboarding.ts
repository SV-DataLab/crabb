export type SocioOnboardingStatus =
  | 'activated'
  | 'pending'
  | 'account_exists'
  | 'request_exists'
  | 'identity_mismatch'
  | 'missing_solicitud_data'

export type SocioOnboardingPayload = {
  dni_cuit: string
  email: string
  password: string
  password_confirmation: string
  device_name?: string
  nombre_apellido?: string
  denominacion_taller?: string
  celular?: string
  rubro?: string
  direccion?: string
  localidad?: string
  observaciones?: string
}

export type SocioOnboardingResult = {
  status: SocioOnboardingStatus
  message?: string
  token?: string
  access_token?: string
  user?: unknown
}
