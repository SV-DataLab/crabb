import { useEffect, useState, type FormEvent } from 'react'
import { ReadOnlyField } from '../features/socio-carnet/components/ReadOnlyField'
import { socioSelfService } from '../services/socioSelfService'
import type { SocioMe } from '../types/socioSelfService'

const inputClassName =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20'

function emailsToInput(value: SocioMe['emails']): string {
  if (Array.isArray(value)) return value.join(', ')
  return value ?? ''
}

function inputToEmails(value: string): string | string[] {
  const parts = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  if (parts.length <= 1) return parts[0] ?? ''
  return parts
}

type EditableFields = {
  celular: string
  emails: string
  direccion: string
  denominacion_taller: string
}

export function SocioPerfilPage() {
  const [profile, setProfile] = useState<SocioMe | null>(null)
  const [form, setForm] = useState<EditableFields>({
    celular: '',
    emails: '',
    direccion: '',
    denominacion_taller: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    socioSelfService
      .getMe()
      .then((data) => {
        if (!active) return
        setProfile(data)
        setForm({
          celular: data.celular ?? '',
          emails: emailsToInput(data.emails),
          direccion: data.direccion ?? '',
          denominacion_taller: data.denominacionTaller ?? '',
        })
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : 'No se pudo cargar tu perfil.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const updated = await socioSelfService.updateMe({
        celular: form.celular.trim() || undefined,
        emails: inputToEmails(form.emails),
        direccion: form.direccion.trim() || undefined,
        denominacion_taller: form.denominacion_taller.trim() || undefined,
      })
      setProfile(updated)
      setForm({
        celular: updated.celular ?? '',
        emails: emailsToInput(updated.emails),
        direccion: updated.direccion ?? '',
        denominacion_taller: updated.denominacionTaller ?? '',
      })
      setSuccessMessage('Tus datos se actualizaron correctamente.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-600">Cargando perfil...</p>
  }

  if (errorMessage && !profile) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {errorMessage}
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        No se encontró un perfil de socio vinculado a tu cuenta.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">Mi perfil</h1>
        <p className="mt-1 text-sm text-slate-600">
          Podés actualizar tus datos de contacto. Los campos administrativos son de solo lectura.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Datos del padrón</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <ReadOnlyField label="Nº de socio" value={profile.nroSocio} />
          <ReadOnlyField label="Nombre y apellido" value={profile.nombreApellido} />
          <ReadOnlyField label="Rubro" value={profile.rubro ?? '—'} />
          <ReadOnlyField label="Categoría" value={profile.categoria ?? '—'} />
          <ReadOnlyField label="Condición" value={profile.condicion ?? '—'} />
          <ReadOnlyField label="Estado" value={profile.estado ?? '—'} />
          {profile.estadoCuota ? (
            <ReadOnlyField label="Estado de cuota" value={profile.estadoCuota} />
          ) : null}
        </dl>
      </section>

      <form className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Datos editables</h2>

        {successMessage ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {successMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="celular">
              Celular
            </label>
            <input
              id="celular"
              className={`${inputClassName} mt-1`}
              value={form.celular}
              onChange={(event) => setForm((prev) => ({ ...prev, celular: event.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="emails">
              Emails
            </label>
            <input
              id="emails"
              className={`${inputClassName} mt-1`}
              value={form.emails}
              onChange={(event) => setForm((prev) => ({ ...prev, emails: event.target.value }))}
              placeholder="email@ejemplo.com"
            />
            <p className="mt-1 text-xs text-slate-500">Separá varios emails con coma.</p>
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="direccion">
              Dirección
            </label>
            <input
              id="direccion"
              className={`${inputClassName} mt-1`}
              value={form.direccion}
              onChange={(event) => setForm((prev) => ({ ...prev, direccion: event.target.value }))}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="denominacion_taller">
              Taller / comercio
            </label>
            <input
              id="denominacion_taller"
              className={`${inputClassName} mt-1`}
              value={form.denominacion_taller}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, denominacion_taller: event.target.value }))
              }
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
