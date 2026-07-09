import { useState } from 'react'

type CopyCarnetLinkButtonProps = {
  url: string
}

export function CopyCarnetLinkButton({ url }: CopyCarnetLinkButtonProps) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCopy = async () => {
    setError(null)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('No se pudo copiar el enlace.')
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-800"
      >
        {copied ? 'Enlace copiado' : 'Copiar enlace de verificación'}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <p className="break-all text-xs text-slate-500">{url}</p>
    </div>
  )
}
