import { lazy, Suspense } from 'react'

const QrCode = lazy(() => import('react-qr-code').then((module) => ({ default: module.default })))

type SocioQrBoxProps = {
  value: string
}

export function SocioQrBox({ value }: SocioQrBoxProps) {
  if (!value.trim()) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
        QR no disponible. Usá el enlace de verificación.
      </div>
    )
  }

  return (
    <div className="flex justify-center rounded-xl border border-slate-200 bg-white p-4">
      <Suspense
        fallback={
          <div className="flex h-48 w-48 items-center justify-center text-sm text-slate-500">
            Generando QR...
          </div>
        }
      >
        <QrCode value={value} size={192} />
      </Suspense>
    </div>
  )
}
