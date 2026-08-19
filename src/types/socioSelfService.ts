export type SocioMe = {
  id?: number | string
  nroSocio: string
  nombreApellido: string
  denominacionTaller?: string | null
  rubro?: string | null
  celular?: string | null
  emails?: string[] | string | null
  direccion?: string | null
  localidad?: string | null
  categoria?: string | null
  condicion?: string | null
  estado?: string | null
  estadoCuota?: string | null
  fotoUrl?: string | null
  perfilActualizadoEn?: string | null
}

export type UpdateSocioMePayload = {
  celular?: string
  emails?: string | string[]
  direccion?: string
  denominacion_taller?: string
}
