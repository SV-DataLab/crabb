import { useEffect, useState } from 'react'
import { SocioCarnetCard } from '../features/socio-carnet/components/SocioCarnetCard'
import { socioSelfService } from '../services/socioSelfService'
import type { SocioCarnet } from '../types/socioCarnet'

export function SocioCarnetPage() {
  const [carnet, setCarnet] = useState<SocioCarnet | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    socioSelfService
      .getCarnet()
      .then((data) => {
        if (active) setCarnet(data)
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : 'No se pudo cargar tu carnet.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return <p className="text-sm text-slate-600">Cargando carnet...</p>
  }

  if (errorMessage) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {errorMessage}
      </div>
    )
  }

  if (!carnet) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        No se encontró información de carnet para tu cuenta.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">Mi carnet</h1>
        <p className="mt-1 text-sm text-slate-600">
          Mostrá este carnet o el código QR para verificar tu condición de socio.
        </p>
      </header>
      <SocioCarnetCard carnet={carnet} />
    </div>
  )
}
