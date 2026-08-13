import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ClientBookingForm } from '../features/public-workshop-booking/components/ClientBookingForm'
import { DateSelector } from '../features/public-workshop-booking/components/DateSelector'
import { ServiceSelector } from '../features/public-workshop-booking/components/ServiceSelector'
import { TimeSlotsSection } from '../features/public-workshop-booking/components/TimeSlotsSection'
import { WorkshopHeaderCard } from '../features/public-workshop-booking/components/WorkshopHeaderCard'
import { PublicWorkshopError, publicWorkshopService } from '../services/publicWorkshopService'
import {
  EMPTY_CLIENT_FORM_DATA,
  type PublicWorkshop,
  type PublicWorkshopClientFormData,
  type PublicWorkshopService,
  type PublicWorkshopTimeSlot,
  type TimeSlotsStatus,
  type WorkshopStatus,
} from '../types/publicWorkshopBooking'

const todayIso = () => new Date().toISOString().slice(0, 10)

// Etapa 2: no hay endpoint de servicios en el contrato de TallerOK API
// todavía, así que esta sección se mantiene visual (sin inventar datos).
const services: PublicWorkshopService[] = []
const isServicesLoading = false

export function PublicWorkshopBookingPage() {
  const { slug } = useParams<{ slug: string }>()
  const trimmedSlug = slug?.trim() ?? ''

  const [workshop, setWorkshop] = useState<PublicWorkshop | null>(null)
  const [workshopStatus, setWorkshopStatus] = useState<WorkshopStatus>('loading')
  const [workshopRetryToken, setWorkshopRetryToken] = useState(0)

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<PublicWorkshopTimeSlot | null>(null)
  const [slots, setSlots] = useState<PublicWorkshopTimeSlot[]>([])
  const [timeSlotsStatus, setTimeSlotsStatus] = useState<TimeSlotsStatus>('idle')
  const [clientForm, setClientForm] = useState<PublicWorkshopClientFormData>(EMPTY_CLIENT_FORM_DATA)

  const minDate = useMemo(() => todayIso(), [])

  useEffect(() => {
    if (!trimmedSlug) {
      setWorkshopStatus('not-found')
      return
    }

    const controller = new AbortController()
    setWorkshopStatus('loading')

    publicWorkshopService
      .getBySlug(trimmedSlug, controller.signal)
      .then((data) => {
        setWorkshop(data)
        setWorkshopStatus('found')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setWorkshopStatus(error instanceof PublicWorkshopError && error.notFound ? 'not-found' : 'error')
      })

    return () => controller.abort()
  }, [trimmedSlug, workshopRetryToken])

  useEffect(() => {
    setSelectedSlot(null)

    if (!selectedDate || workshopStatus !== 'found') {
      setSlots([])
      setTimeSlotsStatus('idle')
      return
    }

    const controller = new AbortController()
    setTimeSlotsStatus('loading')

    publicWorkshopService
      .getDisponibilidad(trimmedSlug, selectedDate, controller.signal)
      .then((data) => {
        setSlots(data)
        setTimeSlotsStatus(data.length > 0 ? 'ready' : 'empty')
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setSlots([])
        setTimeSlotsStatus('error')
      })

    return () => controller.abort()
  }, [trimmedSlug, selectedDate, workshopStatus])

  const handleRetryWorkshop = useCallback(() => {
    setWorkshopRetryToken((token) => token + 1)
  }, [])

  function handleSubmit() {
    // Etapa 2: todavía sin envío real al backend. Se conecta en la Etapa 3.
  }

  return (
    <div className="min-h-screen min-h-dvh bg-slate-50 px-4 py-8 sm:py-10" data-workshop-slug={trimmedSlug}>
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <header className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Solicitá un turno</h1>
          <p className="mt-1 text-sm text-slate-600">
            Servicio de turnos para talleres asociados a CRABB
          </p>
        </header>

        <WorkshopHeaderCard workshop={workshop} status={workshopStatus} onRetry={handleRetryWorkshop} />

        {workshopStatus === 'found' ? (
          <>
            <ServiceSelector
              services={services}
              loading={isServicesLoading}
              selectedServiceId={selectedServiceId}
              onSelect={setSelectedServiceId}
            />

            <DateSelector value={selectedDate} onChange={setSelectedDate} minDate={minDate} />

            <TimeSlotsSection
              status={timeSlotsStatus}
              slots={slots}
              selectedSlot={selectedSlot}
              onSelect={setSelectedSlot}
            />

            <ClientBookingForm
              value={clientForm}
              onChange={setClientForm}
              onSubmit={handleSubmit}
              canSubmit={false}
            />
          </>
        ) : null}
      </div>
    </div>
  )
}
