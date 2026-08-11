export type SocioCarnet = {
  nroSocio: string
  nombreApellido: string
  denominacionTaller?: string | null
  categoria?: string | null
  condicion?: string | null
  estado?: string | null
  estadoCarnet: 'valido' | 'no_valido' | string
  verificationUrl: string
  qrPayload: string
  perfilActualizadoEn?: string | null
}

export type PublicCarnet = {
  valid: boolean
  nroSocio: string
  nombreApellido: string
  denominacionTaller?: string | null
  categoria?: string | null
  condicion?: string | null
  estado?: string | null
  estadoCarnet: 'valido' | 'no_valido' | string
}
