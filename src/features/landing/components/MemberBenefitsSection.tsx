import { Link } from 'react-router-dom'
import { MEMBER_BENEFITS } from '../constants'
import { LandingReveal } from './LandingReveal'
import { LandingSectionHeader } from './LandingSectionHeader'

export function MemberBenefitsSection() {
  return (
    <section
      id="beneficios"
      className="relative w-full bg-gradient-to-b from-[#edf3fb] via-white to-[#f5f9ff] px-6 py-16 sm:py-20 lg:px-8"
    >
      <div className="relative mx-auto max-w-7xl">
        <LandingReveal>
          <LandingSectionHeader
            eyebrow="Socios"
            title="Ser parte de CRABB"
            description="La membresía institucional conecta talleres y empresas con representación, formación, información técnica y herramientas de gestión."
          />
        </LandingReveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <LandingReveal delayMs={80}>
            <ul className="grid gap-3 sm:grid-cols-2">
              {MEMBER_BENEFITS.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
                >
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                      <path
                        d="M4 10.5L8 14.5L16 6.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-slate-800">{benefit}</span>
                </li>
              ))}
            </ul>
          </LandingReveal>

          <LandingReveal delayMs={160}>
            <div className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-[#113059] via-[#0f2747] to-[#0b1f3a] p-6 text-white shadow-xl sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">
                Acceso y asociación
              </p>
              <h3 className="mt-3 text-2xl font-semibold">Sumate o ingresá al panel</h3>
              <p className="mt-3 text-sm leading-7 text-sky-100/85">
                Si ya sos socio, accedé a tu panel. Si querés asociarte, consultá el proceso institucional
                con nuestro equipo.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full bg-sky-300 px-5 py-3 text-sm font-bold text-[#06213c] transition hover:bg-sky-200"
                >
                  Ingresar al panel
                </Link>
                <a
                  href="#contacto"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-sky-200/40 hover:bg-white/[0.08]"
                >
                  Consultar asociación
                </a>
              </div>
            </div>
          </LandingReveal>
        </div>
      </div>
    </section>
  )
}
