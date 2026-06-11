import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CAMPANIA_DEFAULT_ID, CAMPANIAS_COBRANZA, getCampaniaById, INTERVALO_ENVIO_MS, COUNTDOWN_TICK_MS } from '../constants'
import { gestionCobranzasService } from '../services/gestionCobranzasService'
import type {
  CampaniaCobranza,
  CampaniaCobranzaId,
  CampanaHistorial,
  EstadoEnvioFila,
  FaseCobranzas,
  LogEntry,
  ResumenCampana,
  SendProgress,
  SocioCobranza,
} from '../types'
import { validatePhone } from '../utils/validatePhone'

type AdminInfo = {
  nombre: string
  email: string
}

function crearLog(mensaje: string): LogEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    mensaje,
  }
}

function estadoEnvioInicial(seleccionado: boolean, telefono: string): EstadoEnvioFila {
  if (!seleccionado) return 'no_seleccionado'
  if (!validatePhone(telefono).valido) return 'numero_invalido'
  return 'pendiente_envio'
}

export function useGestionCobranzasEnvio(admin: AdminInfo) {
  const [members, setMembers] = useState<SocioCobranza[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [fase, setFase] = useState<FaseCobranzas>('inicial')
  const [isPreparing, setIsPreparing] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isCancelled, setIsCancelled] = useState(false)
  const [currentMember, setCurrentMember] = useState<SocioCobranza | null>(null)
  const [sendProgress, setSendProgress] = useState<SendProgress>({
    total: 0,
    enviados: 0,
    pendientes: 0,
    errores: 0,
    cancelados: 0,
    invalidos: 0,
  })
  const [nextSendInMs, setNextSendInMs] = useState(0)
  const [sendLog, setSendLog] = useState<LogEntry[]>([])
  const [resumenFinal, setResumenFinal] = useState<ResumenCampana | null>(null)
  const [historial, setHistorial] = useState<CampanaHistorial[]>([])
  const [ultimoEnvio, setUltimoEnvio] = useState<CampanaHistorial | null>(null)
  const [filtroDeuda, setFiltroDeuda] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [campaniaId, setCampaniaId] = useState<CampaniaCobranzaId>(CAMPANIA_DEFAULT_ID)
  const [campanias, setCampanias] = useState<CampaniaCobranza[]>(CAMPANIAS_COBRANZA)
  const [totalActivos, setTotalActivos] = useState(0)
  const [sociosConDeuda, setSociosConDeuda] = useState(0)
  const [ejemploPreview, setEjemploPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const isSendingRef = useRef(false)
  const cancelledRef = useRef(false)
  const countdownTimerRef = useRef<number | null>(null)

  const appendLog = useCallback((mensaje: string) => {
    setSendLog((prev) => [...prev, crearLog(mensaje)])
  }, [])

  const loadInitial = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const [resumen, candidatos, hist] = await Promise.all([
        gestionCobranzasService.obtenerResumen(),
        gestionCobranzasService.listarCandidatos(),
        gestionCobranzasService.obtenerHistorial(),
      ])
      setTotalActivos(resumen.totalActivos)
      setSociosConDeuda(resumen.sociosConDeuda)
      if (resumen.campaigns.length > 0) {
        setCampanias(resumen.campaigns)
      }
      setMembers(candidatos)
      setHistorial(hist)
      setUltimoEnvio(hist[0] ?? null)
    } catch {
      setLoadError('No se pudieron cargar los datos de cobranzas.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadInitial()
  }, [loadInitial])

  const membersFiltrados = useMemo(() => {
    return members.filter((m) => {
      if (!m.activo) return false
      if (filtroDeuda && m.estadoCuota !== filtroDeuda) return false
      if (busqueda.trim() && !m.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())) return false
      return true
    })
  }, [members, filtroDeuda, busqueda])

  const seleccionStats = useMemo(() => {
    const seleccionados = members.filter((m) => selectedIds.has(m.id))
    let validos = 0
    let invalidos = 0
    for (const m of seleccionados) {
      if (validatePhone(m.telefono).valido) validos += 1
      else invalidos += 1
    }
    return { seleccionados: seleccionados.length, validos, invalidos }
  }, [members, selectedIds])

  const campaniaSeleccionada = useMemo(
    () => campanias.find((c) => c.id === campaniaId) ?? getCampaniaById(campaniaId),
    [campaniaId, campanias],
  )

  useEffect(() => {
    const elegible = members.find((m) => selectedIds.has(m.id) && validatePhone(m.telefono).valido)
    const socio = elegible ?? members.find((m) => m.activo && validatePhone(m.telefono).valido)

    if (!socio) {
      setEjemploPreview(null)
      return
    }

    let cancelled = false

    void gestionCobranzasService
      .previsualizarMensaje(campaniaId, socio.id)
      .then((mensaje) => {
        if (!cancelled) setEjemploPreview(mensaje)
      })
      .catch(() => {
        if (!cancelled) setEjemploPreview(null)
      })

    return () => {
      cancelled = true
    }
  }, [members, selectedIds, campaniaId])

  const setCampaniaSeleccionada = useCallback(
    (id: CampaniaCobranzaId) => {
      if (isSending || isPreparing || fase !== 'inicial') return
      setCampaniaId(id)
    },
    [fase, isPreparing, isSending],
  )

  const syncEstadosEnvio = useCallback(
    (ids: Set<string>) => {
      setMembers((prev) =>
        prev.map((m) => ({
          ...m,
          estadoEnvio: estadoEnvioInicial(ids.has(m.id), m.telefono),
        })),
      )
    },
    [],
  )

  const toggleSeleccion = useCallback(
    (id: string) => {
      if (isSending || isPreparing) return
      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        syncEstadosEnvio(next)
        return next
      })
    },
    [isSending, isPreparing, syncEstadosEnvio],
  )

  const seleccionarTodos = useCallback(() => {
    if (isSending || isPreparing) return
    const ids = new Set(membersFiltrados.map((m) => m.id))
    setSelectedIds(ids)
    syncEstadosEnvio(ids)
  }, [isSending, isPreparing, membersFiltrados, syncEstadosEnvio])

  const deseleccionarTodos = useCallback(() => {
    if (isSending || isPreparing) return
    setSelectedIds(new Set())
    syncEstadosEnvio(new Set())
  }, [isSending, isPreparing, syncEstadosEnvio])

  const prepararEnvio = useCallback(() => {
    if (isSendingRef.current || isSending || isPreparing) return
    if (fase === 'enviando') return
    if (selectedIds.size === 0) return

    setIsPreparing(true)
    syncEstadosEnvio(selectedIds)
    setFase('confirmacion')
    setIsPreparing(false)
  }, [fase, isPreparing, isSending, selectedIds, syncEstadosEnvio])

  const cancelarCountdown = useCallback(() => {
    if (countdownTimerRef.current !== null) {
      window.clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
    setNextSendInMs(0)
  }, [])

  const runCountdown = useCallback(
    (ms: number) =>
      new Promise<void>((resolve) => {
        cancelarCountdown()
        setNextSendInMs(ms)
        const started = Date.now()
        countdownTimerRef.current = window.setInterval(() => {
          const remaining = Math.max(0, ms - (Date.now() - started))
          setNextSendInMs(remaining)
          if (remaining <= 0) {
            cancelarCountdown()
            resolve()
          }
        }, COUNTDOWN_TICK_MS)
      }),
    [cancelarCountdown],
  )

  const finalizarCampana = useCallback(
    (params: {
      cancelado: boolean
      progreso: SendProgress
      fechaInicio: string
    }) => {
      const { cancelado, progreso, fechaInicio } = params
      const fechaFin = new Date().toISOString()

      let estadoFinal: CampanaHistorial['estadoFinal'] = 'Finalizado'
      if (cancelado) estadoFinal = 'Cancelado'
      else if (progreso.errores > 0) estadoFinal = 'Con errores'

      const entry: CampanaHistorial = {
        id: crypto.randomUUID(),
        fechaInicio,
        fechaFin,
        tipoRecordatorio: campaniaSeleccionada.label,
        adminNombre: admin.nombre,
        adminEmail: admin.email,
        seleccionados: progreso.total,
        enviados: progreso.enviados,
        errores: progreso.errores,
        cancelados: progreso.cancelados,
        invalidos: progreso.invalidos,
        estadoFinal,
      }

      const updated = gestionCobranzasService.guardarEntradaHistorial(entry)
      setHistorial(updated)
      setUltimoEnvio(entry)
      setResumenFinal({
        campaniaLabel: campaniaSeleccionada.label,
        seleccionados: progreso.total,
        enviados: progreso.enviados,
        errores: progreso.errores,
        cancelados: progreso.cancelados,
        invalidos: progreso.invalidos,
        fechaFin,
      })
      setFase('finalizado')
      setIsSending(false)
      isSendingRef.current = false
      setCurrentMember(null)
      appendLog('Campaña finalizada')
    },
    [admin.email, admin.nombre, appendLog, campaniaSeleccionada.label],
  )

  const confirmarYComenzarEnvio = useCallback(async () => {
    if (isSendingRef.current || isSending) return
    if (fase !== 'confirmacion') return
    if (seleccionStats.validos === 0) return

    isSendingRef.current = true
    cancelledRef.current = false
    setIsCancelled(false)
    setIsSending(true)
    setFase('enviando')
    setSendLog([])
    setResumenFinal(null)

    const cola = members.filter(
      (m) => selectedIds.has(m.id) && validatePhone(m.telefono).valido && m.estadoEnvio === 'pendiente_envio',
    )
    const invalidosCount = members.filter((m) => selectedIds.has(m.id) && !validatePhone(m.telefono).valido).length

    const progreso: SendProgress = {
      total: selectedIds.size,
      enviados: 0,
      pendientes: cola.length,
      errores: 0,
      cancelados: 0,
      invalidos: invalidosCount,
    }
    setSendProgress(progreso)
    appendLog(`Campaña seleccionada: ${campaniaSeleccionada.label}`)
    appendLog(`Inicio de envío simulado · ${cola.length} socios en cola`)

    const fechaInicio = new Date().toISOString()

    for (let i = 0; i < cola.length; i += 1) {
      if (cancelledRef.current) {
        const restantes = cola.slice(i)
        setMembers((prev) =>
          prev.map((m) =>
            restantes.some((r) => r.id === m.id) ? { ...m, estadoEnvio: 'cancelado' as const } : m,
          ),
        )
        progreso.cancelados += restantes.length
        progreso.pendientes = 0
        setSendProgress({ ...progreso })
        appendLog('Envío cancelado por el administrador')
        finalizarCampana({ cancelado: true, progreso: { ...progreso }, fechaInicio })
        return
      }

      const member = cola[i]
      setCurrentMember(member)
      appendLog(`Enviando mensaje a: ${member.nombre}`)

      const texto = await gestionCobranzasService.previsualizarMensaje(campaniaId, member.id)
      const result = await gestionCobranzasService.enviarRecordatorio(member, texto, campaniaId)

      if (cancelledRef.current) {
        setMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, estadoEnvio: 'cancelado' } : m)),
        )
        const restantes = cola.slice(i + 1)
        setMembers((prev) =>
          prev.map((m) =>
            restantes.some((r) => r.id === m.id) ? { ...m, estadoEnvio: 'cancelado' as const } : m,
          ),
        )
        progreso.cancelados += restantes.length + (result.ok ? 0 : 0)
        if (!result.ok) {
          progreso.errores += 1
          setMembers((prev) =>
            prev.map((m) => (m.id === member.id ? { ...m, estadoEnvio: 'error' } : m)),
          )
        } else {
          progreso.enviados += 1
          setMembers((prev) =>
            prev.map((m) => (m.id === member.id ? { ...m, estadoEnvio: 'enviado' } : m)),
          )
        }
        progreso.pendientes = 0
        setSendProgress({ ...progreso })
        appendLog('Envío cancelado por el administrador')
        finalizarCampana({ cancelado: true, progreso: { ...progreso }, fechaInicio })
        return
      }

      if (result.ok) {
        progreso.enviados += 1
        appendLog(`Mensaje enviado a ${member.nombre}`)
        setMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, estadoEnvio: 'enviado' } : m)),
        )
      } else {
        progreso.errores += 1
        appendLog(`Error al enviar a ${member.nombre}: ${result.error ?? 'Error desconocido'}`)
        setMembers((prev) =>
          prev.map((m) =>
            m.id === member.id
              ? { ...m, estadoEnvio: result.error?.includes('inválido') || result.error?.includes('faltante') ? 'numero_invalido' : 'error' }
              : m,
          ),
        )
      }

      progreso.pendientes = Math.max(0, cola.length - (i + 1))
      setSendProgress({ ...progreso })

      if (i < cola.length - 1) {
        appendLog('Esperando 1,5 segundos para el próximo envío')
        await runCountdown(INTERVALO_ENVIO_MS)
        if (cancelledRef.current) {
          const restantes = cola.slice(i + 1)
          setMembers((prev) =>
            prev.map((m) =>
              restantes.some((r) => r.id === m.id) ? { ...m, estadoEnvio: 'cancelado' as const } : m,
            ),
          )
          progreso.cancelados += restantes.length
          progreso.pendientes = 0
          setSendProgress({ ...progreso })
          appendLog('Envío cancelado por el administrador')
          finalizarCampana({ cancelado: true, progreso: { ...progreso }, fechaInicio })
          return
        }
      }
    }

    setCurrentMember(null)
    finalizarCampana({ cancelado: false, progreso: { ...progreso }, fechaInicio })
  }, [
    appendLog,
    fase,
    finalizarCampana,
    isSending,
    members,
    runCountdown,
    selectedIds,
    seleccionStats.validos,
    campaniaId,
    campaniaSeleccionada.label,
  ])

  const cancelarEnvio = useCallback(() => {
    if (!isSendingRef.current) return
    cancelledRef.current = true
    setIsCancelled(true)
    appendLog('Solicitud de cancelación recibida…')
  }, [appendLog])

  const reiniciarParaNuevoEnvio = useCallback(() => {
    if (isSendingRef.current) return
    setSelectedIds(new Set())
    setFase('inicial')
    setSendLog([])
    setResumenFinal(null)
    setCurrentMember(null)
    setIsCancelled(false)
    cancelledRef.current = false
    setSendProgress({ total: 0, enviados: 0, pendientes: 0, errores: 0, cancelados: 0, invalidos: 0 })
    setCampaniaId(CAMPANIA_DEFAULT_ID)
    void loadInitial()
  }, [loadInitial])

  const verHistorial = useCallback(() => {
    if (isSendingRef.current) return
    setFase('historial')
  }, [])

  const volverDesdeHistorial = useCallback(() => {
    if (isSendingRef.current) return
    setFase('inicial')
  }, [])

  const volverDesdeConfirmacion = useCallback(() => {
    if (isSendingRef.current) return
    setFase('inicial')
  }, [])

  useEffect(() => {
    return () => cancelarCountdown()
  }, [cancelarCountdown])

  return {
    members: membersFiltrados,
    allMembers: members,
    selectedIds,
    fase,
    isPreparing,
    isSending,
    isCancelled,
    currentMember,
    sendProgress,
    nextSendInMs,
    sendLog,
    resumenFinal,
    historial,
    ultimoEnvio,
    filtroDeuda,
    setFiltroDeuda,
    busqueda,
    setBusqueda,
    isLoading,
    loadError,
    totalActivos,
    sociosConDeuda,
    seleccionStats,
    ejemploPreview,
    campaniaSeleccionada,
    campanias,
    setCampaniaSeleccionada,
    intervalMs: INTERVALO_ENVIO_MS,
    toggleSeleccion,
    seleccionarTodos,
    deseleccionarTodos,
    prepararEnvio,
    confirmarYComenzarEnvio,
    cancelarEnvio,
    reiniciarParaNuevoEnvio,
    verHistorial,
    volverDesdeHistorial,
    volverDesdeConfirmacion,
  }
}
