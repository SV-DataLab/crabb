import type { SocioCarnet } from '../../../types/socioCarnet'
import { CarnetPhoto } from './CarnetPhoto'
import { CopyCarnetLinkButton } from './CopyCarnetLinkButton'
import { ReadOnlyField } from './ReadOnlyField'
import { SocioQrBox } from './SocioQrBox'
import { SocioStatusBadge } from './SocioStatusBadge'

type SocioCarnetCardProps = {
  carnet: SocioCarnet
}

/**
 * Arma la URL de verificación con el origin actual del navegador (no un valor
 * fijo del backend), para que el QR apunte siempre al frontend que la sirvió
 * (localhost en desarrollo, producción en producción) sin hardcodear ninguno.
 */
function buildVerificationUrl(carnet: SocioCarnet): string {
  if (carnet.token && typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/carnet/${carnet.token}`
  }
  return carnet.verificationUrl
}

export function SocioCarnetCard({ carnet }: SocioCarnetCardProps) {
  const logoCrabbUrl = `${import.meta.env.BASE_URL}logo-crabb.jpg`
  const verificationUrl = buildVerificationUrl(carnet)
  const qrValue = verificationUrl || carnet.qrPayload

  return (
    <div className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
      <div className="border-b border-slate-200 bg-gradient-to-r from-sky-50 to-white px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoCrabbUrl} alt="CRABB" className="h-10 w-auto object-contain" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">CRABB</p>
              <h2 className="text-lg font-semibold text-slate-900">Carnet de socio</h2>
            </div>
          </div>
          <SocioStatusBadge estadoCarnet={carnet.estadoCarnet} />
        </div>
      </div>

      <div className="space-y-6 px-6 py-6">
        <div className="flex justify-center">
          <CarnetPhoto fotoUrl={carnet.fotoUrl} nombreApellido={carnet.nombreApellido} />
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <ReadOnlyField label="Nombre y apellido" value={carnet.nombreApellido} />
          <ReadOnlyField label="Nº de socio" value={carnet.nroSocio} />
          <ReadOnlyField label="Taller / comercio" value={carnet.denominacionTaller ?? '—'} />
          <ReadOnlyField label="Categoría" value={carnet.categoria ?? '—'} />
          <ReadOnlyField label="Condición" value={carnet.condicion ?? '—'} />
          <ReadOnlyField label="Estado" value={carnet.estado ?? '—'} />
        </dl>

        <SocioQrBox value={qrValue} />

        {verificationUrl ? <CopyCarnetLinkButton url={verificationUrl} /> : null}

        {carnet.perfilActualizadoEn ? (
          <p className="text-xs text-slate-500">
            Actualizado: {new Date(carnet.perfilActualizadoEn).toLocaleString('es-AR')}
          </p>
        ) : null}
      </div>
    </div>
  )
}
