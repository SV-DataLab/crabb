import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { normalizeUser } from '../../services/authService'
import {
  SocioAccountActivationError,
  socioRegistrationService,
} from '../../services/socioRegistrationService'
import { getDefaultAuthenticatedPath } from '../../utils/socioAccess'
import { normalizeDocument } from '../../utils/normalizeDocument'
import { FormValidationErrors } from './FormValidationErrors'

type ActivationFormState = {
  dni_cuit: string
  email: string
  password: string
  password_confirmation: string
}

const initialState: ActivationFormState = {
  dni_cuit: '',
  email: '',
  password: '',
  password_confirmation: '',
}

const inputClassName =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20'

const labelClassName = 'text-sm font-medium text-slate-700'

const MIN_PASSWORD_LENGTH = 8

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function SocioAccountActivationForm() {
  const [form, setForm] = useState<ActivationFormState>(initialState)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorKind, setErrorKind] = useState<SocioAccountActivationError['kind'] | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | undefined>()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [successMode, setSuccessMode] = useState<'created' | 'pending' | null>(null)
  const navigate = useNavigate()
  const { login, establishSession } = useAuth()

  const updateField = (field: keyof ActivationFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validate = (): string | null => {
    if (!form.dni_cuit.trim()) return 'El DNI o CUIT es obligatorio.'
    if (!form.email.trim()) return 'El email es obligatorio.'
    if (!isValidEmail(form.email.trim())) return 'Ingresá un email válido.'
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
    }
    if (form.password !== form.password_confirmation) {
      return 'La confirmación de contraseña no coincide.'
    }
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setErrorKind(null)
    setValidationErrors(undefined)

    const validationError = validate()
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setSubmitting(true)

    try {
      const response = await socioRegistrationService.activateAccount({
        dni_cuit: normalizeDocument(form.dni_cuit.trim()),
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.password_confirmation,
      })

      if (response.pendingApproval) {
        setSuccessMode('pending')
        setSuccessMessage(
          response.message || 'Solicitud enviada. CRABB debe aprobarla.',
        )
        return
      }

      const token = response.token || response.access_token
      if (token) {
        const initialUser = response.user ? normalizeUser(response.user) : undefined
        const currentUser = await establishSession(token, initialUser ?? undefined)
        navigate(getDefaultAuthenticatedPath(currentUser), { replace: true })
        return
      }

      const currentUser = await login({
        email: form.email.trim(),
        password: form.password,
      })
      setSuccessMode('created')
      setSuccessMessage(response.message || 'Cuenta creada correctamente.')
      navigate(getDefaultAuthenticatedPath(currentUser), { replace: true })
    } catch (error) {
      if (error instanceof SocioAccountActivationError) {
        setErrorKind(error.kind)
        setValidationErrors(error.validationErrors)
        setErrorMessage(error.message)
      } else if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('No se pudo crear la cuenta. Intentá nuevamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (successMessage && successMode === 'pending') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-slate-800 shadow-xl shadow-black/10">
        <h2 className="text-xl font-semibold text-amber-900">Solicitud enviada</h2>
        <p className="mt-3 text-sm leading-7 text-amber-900/90">{successMessage}</p>
        <Link
          to="/login"
          className="mt-6 inline-flex rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    )
  }

  if (successMessage && successMode === 'created') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-slate-800 shadow-xl shadow-black/10">
        <h2 className="text-xl font-semibold text-emerald-900">Cuenta activada</h2>
        <p className="mt-3 text-sm leading-7 text-emerald-900/90">{successMessage}</p>
        <Link
          to="/login"
          className="mt-6 inline-flex rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    )
  }

  const showLoginLink =
    errorKind === 'account_exists' ||
    errorKind === 'email_already_used'

  const showJoinLink = errorKind === 'socio_not_found'

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <p>{errorMessage}</p>
          <FormValidationErrors errors={validationErrors} />
          {showJoinLink ? (
            <Link to="/asociarme" className="mt-2 inline-flex font-medium text-red-800 underline">
              Completar solicitud de asociación
            </Link>
          ) : null}
          {showLoginLink ? (
            <Link to="/login" className="mt-2 inline-flex font-medium text-red-800 underline">
              Ir a iniciar sesión
            </Link>
          ) : null}
        </div>
      ) : null}

      <p className="rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-6 text-slate-700">
        Si ya figurás en el padrón de socios de CRABB, podés crear tu cuenta con tu DNI/CUIT y un
        email de contacto.
      </p>

      <div className="space-y-4">
        <div>
          <label className={labelClassName} htmlFor="dni_cuit">
            DNI o CUIT *
          </label>
          <input
            id="dni_cuit"
            className={inputClassName}
            value={form.dni_cuit}
            onChange={(event) => updateField('dni_cuit', event.target.value)}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            required
          />
        </div>

        <div>
          <label className={labelClassName} htmlFor="email">
            Email *
          </label>
          <input
            id="email"
            className={inputClassName}
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className={labelClassName} htmlFor="password">
            Contraseña *
          </label>
          <input
            id="password"
            className={inputClassName}
            value={form.password}
            onChange={(event) => updateField('password', event.target.value)}
            type="password"
            autoComplete="new-password"
            required
          />
          <p className="mt-1 text-xs text-slate-500">Mínimo {MIN_PASSWORD_LENGTH} caracteres.</p>
        </div>

        <div>
          <label className={labelClassName} htmlFor="password_confirmation">
            Confirmar contraseña *
          </label>
          <input
            id="password_confirmation"
            className={inputClassName}
            value={form.password_confirmation}
            onChange={(event) => updateField('password_confirmation', event.target.value)}
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-gradient-to-r from-sky-400 to-sky-500 px-4 py-3 text-sm font-bold uppercase tracking-[0.06em] text-[#06213c] shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? 'Creando cuenta...' : 'Activar cuenta de socio'}
      </button>

      <p className="text-center text-sm text-slate-500">
        ¿Todavía no sos socio?{' '}
        <Link to="/asociarme" className="font-medium text-sky-700 hover:text-sky-900">
          Solicitar asociación
        </Link>
      </p>
    </form>
  )
}
