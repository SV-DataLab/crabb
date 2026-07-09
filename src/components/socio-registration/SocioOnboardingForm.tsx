import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { normalizeUser } from '../../services/authService'
import {
  SocioOnboardingError,
  socioOnboardingService,
} from '../../services/socioOnboardingService'
import { hasLinkedSocio } from '../../utils/socioAccess'
import { normalizeDocument } from '../../utils/normalizeDocument'
import { FormValidationErrors } from './FormValidationErrors'

type OnboardingFormState = {
  dni_cuit: string
  email: string
  password: string
  password_confirmation: string
  nombre_apellido: string
  denominacion_taller: string
  celular: string
  rubro: string
  direccion: string
  localidad: string
  observaciones: string
}

type ResultView =
  | 'form'
  | 'activated'
  | 'pending'
  | 'account_exists'
  | 'request_exists'
  | 'identity_mismatch'

const initialState: OnboardingFormState = {
  dni_cuit: '',
  email: '',
  password: '',
  password_confirmation: '',
  nombre_apellido: '',
  denominacion_taller: '',
  celular: '',
  rubro: '',
  direccion: '',
  localidad: '',
  observaciones: '',
}

const inputClassName =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20'

const labelClassName = 'text-sm font-medium text-slate-700'

const MIN_PASSWORD_LENGTH = 8

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function SocioOnboardingForm() {
  const navigate = useNavigate()
  const { establishSession } = useAuth()
  const [form, setForm] = useState<OnboardingFormState>(initialState)
  const [submitting, setSubmitting] = useState(false)
  const [resultView, setResultView] = useState<ResultView>('form')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | undefined>()
  const [showAdditionalFields, setShowAdditionalFields] = useState(false)
  const [requiresSolicitudData, setRequiresSolicitudData] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const updateField = (field: keyof OnboardingFormState, value: string) => {
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
    if (requiresSolicitudData && !form.nombre_apellido.trim()) {
      return 'El nombre y apellido es obligatorio para enviar la solicitud.'
    }
    return null
  }

  const buildPayload = () => ({
    dni_cuit: normalizeDocument(form.dni_cuit.trim()),
    email: form.email.trim(),
    password: form.password,
    password_confirmation: form.password_confirmation,
    nombre_apellido: form.nombre_apellido.trim() || undefined,
    denominacion_taller: form.denominacion_taller.trim() || undefined,
    celular: form.celular.trim() || undefined,
    rubro: form.rubro.trim() || undefined,
    direccion: form.direccion.trim() || undefined,
    localidad: form.localidad.trim() || undefined,
    observaciones: form.observaciones.trim() || undefined,
  })

  const handleActivated = async (token: string, userRaw?: unknown) => {
    const initialUser = userRaw ? normalizeUser(userRaw) : undefined
    const currentUser = await establishSession(token, initialUser ?? undefined)
    setSuccessMessage('Cuenta activada correctamente.')
    setResultView('activated')

    const targetPath = hasLinkedSocio(currentUser) ? '/mi-carnet' : '/dashboard'
    window.setTimeout(() => {
      navigate(targetPath, { replace: true })
    }, 1500)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setValidationErrors(undefined)

    const validationError = validate()
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setSubmitting(true)

    try {
      const result = await socioOnboardingService.submit(buildPayload())

      switch (result.status) {
        case 'activated': {
          const token = result.token || result.access_token
          if (!token) {
            setErrorMessage('La cuenta se activó pero no recibimos el token de acceso. Intentá iniciar sesión.')
            return
          }
          await handleActivated(token, result.user)
          return
        }
        case 'pending':
          setSuccessMessage(
            result.message ||
              'Solicitud enviada. CRABB revisará tus datos y se comunicará con vos.',
          )
          setResultView('pending')
          return
        case 'account_exists':
          setSuccessMessage(result.message || 'Ya tenés cuenta. Iniciá sesión.')
          setResultView('account_exists')
          return
        case 'request_exists':
          setSuccessMessage(result.message || 'Ya existe una solicitud pendiente con esos datos.')
          setResultView('request_exists')
          return
        case 'identity_mismatch':
          setErrorMessage(
            result.message ||
              'No pudimos validar los datos. Revisá DNI/CUIT y email o contactá a CRABB.',
          )
          setResultView('identity_mismatch')
          return
        case 'missing_solicitud_data':
          setRequiresSolicitudData(true)
          setShowAdditionalFields(true)
          setErrorMessage(
            result.message ||
              'No encontramos tu DNI/CUIT en el padrón. Completá al menos nombre y apellido para enviar la solicitud.',
          )
          return
        default:
          setErrorMessage(result.message || 'No se pudo procesar la solicitud.')
      }
    } catch (error) {
      if (error instanceof SocioOnboardingError) {
        setValidationErrors(error.validationErrors)
        setErrorMessage(error.message)
      } else if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('No se pudo procesar la solicitud. Intentá nuevamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (resultView === 'activated') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-slate-800 shadow-xl shadow-black/10">
        <h2 className="text-xl font-semibold text-emerald-900">Cuenta activada</h2>
        <p className="mt-3 text-sm leading-7 text-emerald-900/90">
          {successMessage || 'Cuenta activada correctamente.'}
        </p>
        <p className="mt-2 text-sm text-emerald-800/85">Redirigiendo a tu área de socio...</p>
      </div>
    )
  }

  if (resultView === 'pending') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-slate-800 shadow-xl shadow-black/10">
        <h2 className="text-xl font-semibold text-emerald-900">Solicitud enviada</h2>
        <p className="mt-3 text-sm leading-7 text-emerald-900/90">
          {successMessage ||
            'Solicitud enviada. CRABB revisará tus datos y se comunicará con vos.'}
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    )
  }

  if (resultView === 'account_exists') {
    return (
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6 text-slate-800 shadow-xl shadow-black/10">
        <h2 className="text-xl font-semibold text-sky-900">Ya tenés cuenta</h2>
        <p className="mt-3 text-sm leading-7 text-sky-900/90">
          {successMessage || 'Ya tenés cuenta. Iniciá sesión.'}
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-800"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    )
  }

  if (resultView === 'request_exists') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-slate-800 shadow-xl shadow-black/10">
        <h2 className="text-xl font-semibold text-amber-900">Solicitud pendiente</h2>
        <p className="mt-3 text-sm leading-7 text-amber-900/90">
          {successMessage || 'Ya existe una solicitud pendiente con esos datos.'}
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    )
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <p>{errorMessage}</p>
          <FormValidationErrors errors={validationErrors} />
        </div>
      ) : null}

      <p className="rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-6 text-slate-700">
        Ingresá tu DNI/CUIT y email. Si ya figurás en el padrón de CRABB, activaremos tu cuenta.
        Si no, podremos crear una solicitud de asociación con los datos adicionales.
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

      <div className="rounded-xl border border-slate-200 bg-slate-50/80">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-800"
          onClick={() => setShowAdditionalFields((value) => !value)}
        >
          <span>
            {requiresSolicitudData
              ? 'Completá los datos de solicitud *'
              : 'Datos adicionales (opcional)'}
          </span>
          <span className="text-slate-500">{showAdditionalFields ? '−' : '+'}</span>
        </button>

        {showAdditionalFields ? (
          <div className="space-y-4 border-t border-slate-200 px-4 py-4">
            {requiresSolicitudData ? (
              <p className="text-sm text-amber-800">
                No encontramos tu DNI/CUIT en el padrón. Completá al menos nombre y apellido para
                enviar la solicitud.
              </p>
            ) : null}

            <div>
              <label className={labelClassName} htmlFor="nombre_apellido">
                Nombre y apellido{requiresSolicitudData ? ' *' : ''}
              </label>
              <input
                id="nombre_apellido"
                className={inputClassName}
                value={form.nombre_apellido}
                onChange={(event) => updateField('nombre_apellido', event.target.value)}
                type="text"
                required={requiresSolicitudData}
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="denominacion_taller">
                Taller / comercio
              </label>
              <input
                id="denominacion_taller"
                className={inputClassName}
                value={form.denominacion_taller}
                onChange={(event) => updateField('denominacion_taller', event.target.value)}
                type="text"
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="celular">
                Celular
              </label>
              <input
                id="celular"
                className={inputClassName}
                value={form.celular}
                onChange={(event) => updateField('celular', event.target.value)}
                type="tel"
                autoComplete="tel"
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="rubro">
                Rubro
              </label>
              <input
                id="rubro"
                className={inputClassName}
                value={form.rubro}
                onChange={(event) => updateField('rubro', event.target.value)}
                type="text"
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="direccion">
                Dirección
              </label>
              <input
                id="direccion"
                className={inputClassName}
                value={form.direccion}
                onChange={(event) => updateField('direccion', event.target.value)}
                type="text"
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="localidad">
                Localidad
              </label>
              <input
                id="localidad"
                className={inputClassName}
                value={form.localidad}
                onChange={(event) => updateField('localidad', event.target.value)}
                type="text"
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="observaciones">
                Observaciones
              </label>
              <textarea
                id="observaciones"
                className={`${inputClassName} min-h-24`}
                value={form.observaciones}
                onChange={(event) => updateField('observaciones', event.target.value)}
              />
            </div>
          </div>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-gradient-to-r from-sky-400 to-sky-500 px-4 py-3 text-sm font-bold uppercase tracking-[0.06em] text-[#06213c] shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? 'Procesando...' : 'Asociarme / Activar mi cuenta'}
      </button>

      <p className="text-center text-sm text-slate-500">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-medium text-sky-700 hover:text-sky-900">
          Iniciar sesión
        </Link>
      </p>
    </form>
  )
}
