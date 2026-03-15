import { useState, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import { calculateParticipantTotal, getAvailableQuantity, getAvailablePercentage } from '@/lib/allocation'
import ParticipantSelector from '@/components/ParticipantSelector'
import AllocationTable from '@/components/AllocationTable'
import TipSplitControl from '@/components/TipSplitControl'
import Button from '@/components/ui/Button'

export default function SplittingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { session, setAllocations, setTipMethod, update } = useSession(id)

  const initialParticipant = searchParams.get('p')
  const [activeId, setActiveId] = useState<string | null>(
    initialParticipant ?? session?.participants.find((p) => !p.confirmed)?.id ?? null,
  )

  const total = useMemo(() => {
    if (!session || !activeId) return 0
    return calculateParticipantTotal(
      activeId,
      session.items,
      session.allocations,
      session.tip,
      session.tipMethod,
      session.participants.length,
      session.exchangeRate,
    )
  }, [session, activeId])

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-muted mb-4">Účet nenalezen</p>
        <button onClick={() => navigate('/')} className="text-primary">Domů</button>
      </div>
    )
  }

  const activeParticipant = session.participants.find((p) => p.id === activeId)
  const displayCurrency = session.exchangeRate ? 'CZK' : session.currency

  function handleAllocationChange(itemId: string, value: number) {
    if (!activeId) return
    const item = session!.items.find((i) => i.id === itemId)
    if (!item) return

    // Clamp value: quantity minus what others already took
    const available = item.splitMode === 'quantity'
      ? getAvailableQuantity(item, session!.allocations, activeId)
      : getAvailablePercentage(item, session!.allocations, activeId)
    const currentAlloc = session!.allocations.find(
      (a) => a.participantId === activeId && a.itemId === itemId,
    )
    const max = (currentAlloc?.value ?? 0) + available
    const clamped = Math.min(max, Math.max(0, value))

    const existing = session!.allocations.filter(
      (a) => !(a.participantId === activeId && a.itemId === itemId),
    )

    if (clamped > 0) {
      existing.push({
        participantId: activeId,
        itemId,
        type: item.splitMode,
        value: clamped,
      })
    }

    setAllocations(existing)
  }

  function handleConfirm() {
    if (!activeId) return

    const updatedParticipants = session!.participants.map((p) =>
      p.id === activeId ? { ...p, confirmed: true, totalAmount: total } : p,
    )

    update({ participants: updatedParticipants })
    navigate(`/ucet/${session!.id}/platba/${activeId}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Rozdělení účtu</h1>
        <button onClick={() => navigate(`/ucet/${id}`)} className="text-muted text-sm">
          Přehled
        </button>
      </div>

      <ParticipantSelector
        participants={session.participants}
        activeId={activeId}
        onSelect={setActiveId}
      />

      {activeParticipant && (
        <div className="mt-4">
          {activeParticipant.confirmed ? (
            <div className="text-center py-8">
              <p className="text-success font-medium mb-2">
                {activeParticipant.name} již potvrdil/a svůj podíl
              </p>
              <p className="text-muted text-sm">
                {activeParticipant.totalAmount} {displayCurrency}
              </p>
              <button
                onClick={() => navigate(`/ucet/${session.id}/platba/${activeId}`)}
                className="text-primary text-sm mt-3"
              >
                Zobrazit QR kód
              </button>
            </div>
          ) : (
            <>
              <AllocationTable
                items={session.items}
                allocations={session.allocations}
                participantId={activeId!}
                onAllocationChange={handleAllocationChange}
              />

              <TipSplitControl
                method={session.tipMethod}
                onChange={setTipMethod}
                tip={session.tip}
              />

              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">
                    {activeParticipant.name} platí
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {total} {displayCurrency}
                  </span>
                </div>
              </div>

              <Button onClick={handleConfirm} fullWidth className="mt-4">
                Potvrdit
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
