export type UserRole = 'admin' | 'socio' | 'superadmin' | 'super_admin' | (string & {})

export type LinkedSocio = {
  id: number | string
  nroSocio: string
  nombreApellido: string
  denominacionTaller: string | null
  rubro: string | null
  categoria: string | null
  condicion: string | null
  estado: string | null
  dniCuit: string | null
  emails: string | null
  celular: string | null
}

export type AuthUser = {
  id: number | string
  name: string
  email: string
  role: UserRole
  socioId?: number | string | null
  socio?: LinkedSocio | null
}

export type LoginPayload = {
  email: string
  password: string
}
