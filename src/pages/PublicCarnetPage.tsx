import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CarnetPhoto } from '../features/socio-carnet/components/CarnetPhoto'
import { ReadOnlyField } from '../features/socio-carnet/components/ReadOnlyField'
import { SocioStatusBadge } from '../features/socio-carnet/components/SocioStatusBadge'
import { usePageMeta } from '../hooks/usePageMeta'
import { PublicCarnetError, publicCarnetService } from '../services/publicCarnetService'
import type { PublicCarnet } from '../types/socioCarnet'

export function PublicCarnetPage() {
  const { token } = useParams<{ token: string }>()
  const trimmedToken = token?.trim() ?? ''
  const [carnet, setCarnet] = useState<PublicCarnet | null>(null)
  const [loading, setLoading] = useState(Boolean(trimmedToken))
  const [notFound, setNotFound] = useState(!trimmedToken)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const logoCrabbUrl = `${import.meta.env.BASE_URL}logo-crabb.jpg`

  usePageMeta('Verificación de carnet | CRABB', 'Verificación pública de carnet de socio de CRABB.', {
    noIndex: true,
  })

  useEffect(() => {
    if (!trimmedToken) return

    let active = true

    publicCarnetService
      .getByToken(trimmedToken)
      .then((data) => {
        if (active) setCarnet(data)
      })
      .catch((error: unknown) => {
        if (!active) return
        if (error instanceof PublicCarnetError && error.notFound) {
          setNotFound(true)
          return
        }
        // Mensaje genérico deliberado: nunca reflejamos el texto crudo del error
        // (podría exponer detalles de red o del backend) en una página pública.
        setErrorMessage('No pudimos verificar el carnet. Probá nuevamente en unos minutos.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [trimmedToken])

  const hasConnectionError = Boolean(errorMessage) && !notFound && !carnet

  const statusTitle = notFound
    ? 'Carnet no encontrado'
    : hasConnectionError
      ? 'No se pudo verificar'
      : carnet?.valid
        ? 'Carnet vigente'
        : 'Carnet no vigente'

  const statusClass = notFound
    ? 'border-red-200 bg-red-50 text-red-800'
    : hasConnectionError
      ? 'border-slate-300 bg-slate-100 text-slate-700'
      : carnet?.valid
        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
        : 'border-amber-200 bg-amber-50 text-amber-900'

  return (
    <div className="flex min-h-screen min-h-dvh items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <img src={logoCrabbUrl} alt="CRABB" className="h-12 w-auto object-contain" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">CRABB</p>
            <h1 className="text-lg font-semibold text-slate-900">Verificación de carnet</h1>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-600">Verificando carnet...</p>
        ) : (
          <>
            <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${statusClass}`}>
              {statusTitle}
            </div>

            {errorMessage ? (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            ) : null}

            {carnet && !notFound ? (
              <div className="mt-6 space-y-4">
                <div className="flex justify-center">
                  <CarnetPhoto fotoUrl={carnet.fotoUrl} nombreApellido={carnet.nombreApellido} />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">Estado del carnet</p>
                  <SocioStatusBadge estadoCarnet={carnet.estadoCarnet} />
                </div>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <ReadOnlyField label="Nombre y apellido" value={carnet.nombreApellido} />
                  <ReadOnlyField label="Nº de socio" value={carnet.nroSocio} />
                  <ReadOnlyField label="Taller / comercio" value={carnet.denominacionTaller ?? '—'} />
                  <ReadOnlyField label="Categoría" value={carnet.categoria ?? '—'} />
                  <ReadOnlyField label="Condición" value={carnet.condicion ?? '—'} />
                  <ReadOnlyField label="Estado" value={carnet.estado ?? '—'} />
                </dl>
              </div>
            ) : null}

            {notFound ? (
              <p className="mt-4 text-sm text-slate-600">
                El enlace de verificación no es válido o expiró. Pedile al socio un enlace actualizado.
              </p>
            ) : null}
          </>
        )}

        <div className="mt-8 border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
          <Link to="/" className="font-medium text-sky-700 hover:text-sky-900">
            Volver al sitio de CRABB
          </Link>
        </div>
      </div>
    </div>
  )
}
