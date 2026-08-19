import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { CarnetPhoto } from '../features/socio-carnet/components/CarnetPhoto'
import { ReadOnlyField } from '../features/socio-carnet/components/ReadOnlyField'
import { socioSelfService } from '../services/socioSelfService'
import type { SocioMe } from '../types/socioSelfService'

const inputClassName =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20'

const FOTO_MAX_BYTES = 5 * 1024 * 1024
const FOTO_ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

function validateFotoFile(file: File): string | null {
  if (!FOTO_ALLOWED_TYPES.includes(file.type)) {
    return 'Formato no permitido. Usá JPEG, PNG o WEBP.'
  }
  if (file.size > FOTO_MAX_BYTES) {
    return 'La imagen no puede superar los 5 MB.'
  }
  return null
}

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

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fotoError, setFotoError] = useState<string | null>(null)
  const [fotoSuccess, setFotoSuccess] = useState<string | null>(null)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [deletingFoto, setDeletingFoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
    [selectedFile],
  )

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

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

  const handleFotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setFotoError(null)
    setFotoSuccess(null)

    if (!file) {
      setSelectedFile(null)
      return
    }

    const validationError = validateFotoFile(file)
    if (validationError) {
      setFotoError(validationError)
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setSelectedFile(file)
  }

  const handleFotoUpload = async () => {
    if (!selectedFile) return

    setUploadingFoto(true)
    setFotoError(null)
    setFotoSuccess(null)

    try {
      const updated = await socioSelfService.uploadFoto(selectedFile)
      setProfile(updated)
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setFotoSuccess('Tu foto se actualizó correctamente.')
    } catch (error) {
      setFotoError(error instanceof Error ? error.message : 'No se pudo subir la foto.')
    } finally {
      setUploadingFoto(false)
    }
  }

  const handleFotoDelete = async () => {
    setDeletingFoto(true)
    setFotoError(null)
    setFotoSuccess(null)

    try {
      const updated = await socioSelfService.deleteFoto()
      setProfile(updated)
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setFotoSuccess('Tu foto se eliminó correctamente.')
    } catch (error) {
      setFotoError(error instanceof Error ? error.message : 'No se pudo eliminar la foto.')
    } finally {
      setDeletingFoto(false)
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
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Foto de carnet</h2>
        <p className="mt-1 text-sm text-slate-600">
          Esta foto se mostrará en tu carnet digital y será visible para cualquier persona que escanee o abra
          tu carnet público, incluso sin iniciar sesión.
        </p>

        {fotoSuccess ? (
          <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {fotoSuccess}
          </p>
        ) : null}

        {fotoError ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {fotoError}
          </p>
        ) : null}

        <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <CarnetPhoto fotoUrl={previewUrl ?? profile.fotoUrl} nombreApellido={profile.nombreApellido} />

          <div className="flex-1 space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="foto">
                Seleccionar imagen
              </label>
              <input
                id="foto"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFotoChange}
                className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-sky-700 hover:file:bg-sky-100"
              />
              <p className="mt-1 text-xs text-slate-500">JPEG, PNG o WEBP. Tamaño máximo 5 MB.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleFotoUpload}
                disabled={!selectedFile || uploadingFoto}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploadingFoto
                  ? 'Guardando...'
                  : profile.fotoUrl
                    ? 'Guardar / reemplazar foto'
                    : 'Guardar foto'}
              </button>

              {profile.fotoUrl ? (
                <button
                  type="button"
                  onClick={handleFotoDelete}
                  disabled={deletingFoto || uploadingFoto}
                  className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingFoto ? 'Eliminando...' : 'Eliminar foto'}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

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
