import { SectionHeader } from '../components/ui/SectionHeader'
import { useAuth } from '../hooks/useAuth'
import { BANNER_SIMULACION } from '../features/gestion-cobranzas/constants'
import { GestionCobranzasCampaniaSelector } from '../features/gestion-cobranzas/components/GestionCobranzasCampaniaSelector'
import { GestionCobranzasConfirmacionPanel } from '../features/gestion-cobranzas/components/GestionCobranzasConfirmacionPanel'
import { GestionCobranzasHistorialSection } from '../features/gestion-cobranzas/components/GestionCobranzasHistorialSection'
import { GestionCobranzasLogPanel } from '../features/gestion-cobranzas/components/GestionCobranzasLogPanel'
import { GestionCobranzasMensajePreview } from '../features/gestion-cobranzas/components/GestionCobranzasMensajePreview'
import {
  GestionCobranzasProgresoPanel,
  GestionCobranzasResumenFinal,
} from '../features/gestion-cobranzas/components/GestionCobranzasProgresoPanel'
import { GestionCobranzasResumenCards } from '../features/gestion-cobranzas/components/GestionCobranzasResumenCards'
import { GestionCobranzasSociosTable } from '../features/gestion-cobranzas/components/GestionCobranzasSociosTable'
import { useGestionCobranzasEnvio } from '../features/gestion-cobranzas/hooks/useGestionCobranzasEnvio'

export function AdminGestionCobranzasPage() {
  const { user } = useAuth()
  const admin = {
    nombre: user?.name ?? 'Administrador',
    email: user?.email ?? 'admin@crabb.local',
  }

  const envio = useGestionCobranzasEnvio(admin)
  const uiLocked = envio.isSending || envio.isPreparing
  const campaniaLocked = uiLocked || envio.fase !== 'inicial'

  return (
    <div className="space-y-4 md:space-y-6">
      <SectionHeader
        title="Gestión de cobranzas"
        subtitle="Desde este módulo podés preparar y enviar recordatorios de pago a socios con cuotas pendientes."
      />

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
        {BANNER_SIMULACION}
      </div>

      {envio.loadError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{envio.loadError}</div>
      ) : null}

      {envio.isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-md">
          Cargando datos de cobranzas…
        </div>
      ) : null}

      {!envio.isLoading && envio.fase === 'historial' ? (
        <GestionCobranzasHistorialSection historial={envio.historial} onVolver={envio.volverDesdeHistorial} />
      ) : null}

      {!envio.isLoading && envio.fase !== 'historial' ? (
        <>
          <GestionCobranzasResumenCards
            totalActivos={envio.totalActivos}
            sociosConDeuda={envio.sociosConDeuda}
            seleccionados={envio.seleccionStats.seleccionados}
            ultimoEnvio={envio.ultimoEnvio}
          />

          <GestionCobranzasCampaniaSelector
            campanias={envio.campanias}
            selectedId={envio.campaniaSeleccionada.id}
            disabled={campaniaLocked}
            onSelect={envio.setCampaniaSeleccionada}
          />

          {envio.fase === 'confirmacion' ? (
            <GestionCobranzasConfirmacionPanel
              campania={envio.campaniaSeleccionada}
              seleccionados={envio.seleccionStats.seleccionados}
              validos={envio.seleccionStats.validos}
              invalidos={envio.seleccionStats.invalidos}
              intervalMs={envio.intervalMs}
              ejemploPreview={envio.ejemploPreview}
              puedeConfirmar={envio.seleccionStats.validos > 0}
              isSending={envio.isSending}
              onConfirmar={() => void envio.confirmarYComenzarEnvio()}
              onVolver={envio.volverDesdeConfirmacion}
            />
          ) : null}

          {envio.fase === 'enviando' ? (
            <>
              <GestionCobranzasProgresoPanel
                campaniaLabel={envio.campaniaSeleccionada.label}
                progress={envio.sendProgress}
                currentMember={envio.currentMember}
                nextSendInMs={envio.nextSendInMs}
                isCancelled={envio.isCancelled}
                onCancelar={envio.cancelarEnvio}
              />
              <GestionCobranzasLogPanel entries={envio.sendLog} />
            </>
          ) : null}

          {envio.fase === 'finalizado' && envio.resumenFinal ? (
            <GestionCobranzasResumenFinal
              resumen={envio.resumenFinal}
              isSending={envio.isSending}
              onVerHistorial={envio.verHistorial}
              onNuevoEnvio={envio.reiniciarParaNuevoEnvio}
            />
          ) : null}

          {envio.fase === 'inicial' ? (
            <>
              <GestionCobranzasSociosTable
                members={envio.members}
                selectedIds={envio.selectedIds}
                busqueda={envio.busqueda}
                filtroDeuda={envio.filtroDeuda}
                disabled={uiLocked}
                onBusquedaChange={envio.setBusqueda}
                onFiltroDeudaChange={envio.setFiltroDeuda}
                onToggle={envio.toggleSeleccion}
                onSeleccionarTodos={envio.seleccionarTodos}
                onDeseleccionarTodos={envio.deseleccionarTodos}
              />
              <GestionCobranzasMensajePreview
                campania={envio.campaniaSeleccionada}
                ejemploRenderizado={envio.ejemploPreview}
              />
              <div>
                <button
                  type="button"
                  disabled={uiLocked || envio.seleccionStats.seleccionados === 0}
                  onClick={envio.prepararEnvio}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Preparar envío
                </button>
                {envio.seleccionStats.seleccionados === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">Seleccioná al menos un socio para preparar un envío simulado.</p>
                ) : null}
              </div>
            </>
          ) : null}

          {envio.fase === 'confirmacion' ? <GestionCobranzasLogPanel entries={envio.sendLog} /> : null}

          {envio.fase === 'inicial' && envio.historial.length > 0 ? (
            <div>
              <button
                type="button"
                onClick={envio.verHistorial}
                className="text-sm font-semibold text-blue-700 hover:underline"
              >
                Ver historial de recordatorios
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
