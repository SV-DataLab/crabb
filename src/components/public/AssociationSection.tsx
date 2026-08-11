import { Link } from 'react-router-dom'

export function AssociationSection() {
  return (
    <section
      id="asociacion"
      className="relative w-full overflow-hidden bg-transparent px-6 py-14 text-white sm:py-16 lg:px-8"
    >
      <div className="relative mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[1.75rem] border border-sky-300/25 bg-gradient-to-br from-[#0c2d52]/90 via-[#0a2445]/85 to-[#061a33]/90 p-6 shadow-[0_28px_60px_-32px_rgba(2,12,31,0.9)] ring-1 ring-sky-200/15 backdrop-blur-md sm:p-8 lg:p-10">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-200/90">
                Asociación
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Asociate a CRABB
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-sky-100/85 sm:text-base">
                Sumate a la cámara y accedé a herramientas institucionales, información técnica,
                capacitaciones y acompañamiento para tu taller o empresa.
              </p>
              <p className="mt-4 text-xs leading-6 text-sky-100/60">
                La solicitud será revisada por la administración de CRABB.
              </p>
            </div>

            <div className="grid gap-4">
              <article className="rounded-2xl border border-white/12 bg-white/[0.06] p-5 transition hover:border-sky-200/30 hover:bg-white/[0.09]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
                  Socios y nuevas solicitudes
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">Asociarme / Activar mi cuenta</h3>
                <p className="mt-2 text-sm leading-6 text-sky-100/75">
                  Un solo formulario: si ya figurás en el padrón activamos tu acceso; si no, enviamos
                  tu solicitud a CRABB.
                </p>
                <Link
                  to="/asociarme"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-sky-300 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#06213c] transition hover:bg-sky-200 sm:w-auto"
                >
                  Comenzar
                </Link>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
