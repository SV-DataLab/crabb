import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../lib/apiClient'
import { useAuth } from '../hooks/useAuth'
import { getDefaultAuthenticatedPath } from '../utils/socioAccess'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const logoCrabbUrl = `${import.meta.env.BASE_URL}logo-crabb.jpg`
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setSubmitting(true)

    try {
      const currentUser = await login({ email, password })
      navigate(getDefaultAuthenticatedPath(currentUser), { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 422 && error.validationErrors) {
        const firstField = Object.keys(error.validationErrors)[0]
        const firstError = firstField ? error.validationErrors[firstField]?.[0] : undefined
        setErrorMessage(firstError ?? 'Revisá los campos del formulario.')
      } else if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('No se pudo iniciar sesión.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen min-h-dvh w-full items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <img
            src={logoCrabbUrl}
            alt="CRABB"
            className="mx-auto mb-5 h-16 w-auto max-w-[200px] object-contain"
          />
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Ingreso{' '}
            <span translate="no" className="notranslate">
              CRABB
            </span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">Acceso institucional</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {errorMessage ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
          ) : null}
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            type="password"
            required
            placeholder="Contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {submitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 space-y-3 border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
          <p>
            ¿Querés asociarte o activar tu cuenta de socio?{' '}
            <Link to="/asociarme" className="font-medium text-blue-700 hover:text-blue-900">
              Asociarme / Activar mi cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
