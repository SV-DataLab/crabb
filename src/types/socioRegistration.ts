export type SocioJoinRequestPayload = {
  nombre_apellido: string
  denominacion_taller?: string
  dni_cuit: string
  celular?: string
  email: string
  rubro?: string
  direccion?: string
  localidad?: string
  observaciones?: string
}

export type SocioAccountActivationPayload = {
  dni_cuit: string
  email: string
  password: string
  password_confirmation: string
}

export type SocioJoinRequestData = {
  id: number | string
  estado: string
}

export type SocioJoinRequestResponse = {
  message?: string
  data?: SocioJoinRequestData
}

export type SocioAccountActivationResponse = {
  message?: string
  token?: string
  access_token?: string
  pendingApproval?: boolean
  user?: {
    id: number | string
    role: string
    email?: string
    name?: string
    socio_id?: number | string | null
    socio?: unknown
  }
}

export type SocioJoinRequestErrorKind =
  | 'validation'
  | 'socio_already_exists'
  | 'solicitud_exists'
  | 'rate_limit'
  | 'unknown'

export type SocioAccountActivationErrorKind =
  | 'validation'
  | 'socio_not_found'
  | 'email_mismatch'
  | 'account_exists'
  | 'email_already_used'
  | 'rate_limit'
  | 'unknown'
