import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import { getAccountSettings } from '@/lib/localStorage'
import { callFunction } from '@/lib/api'
import type { BillItem } from '@/types/session'
import { v4 as uuid } from 'uuid'
import ReceiptScanner from '@/components/ReceiptScanner'
import BillEditor from '@/components/BillEditor'
import ParticipantInput from '@/components/ParticipantInput'
import SessionOverview from '@/components/SessionOverview'
import Button from '@/components/ui/Button'

interface ParseResult {
  restaurantName: string
  currency: string
  receiptTotal: number
  items: BillItem[]
}

export default function SessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { session, update, setItems, setParticipants, setTip, setStatus } = useSession(id)
  const [showParticipants, setShowParticipants] = useState(false)

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-muted mb-4">Účet nenalezen</p>
        <button onClick={() => navigate('/')} className="text-primary">
          Zpět na hlavní stránku
        </button>
      </div>
    )
  }

  const account = getAccountSettings()

  function handleScanResult(data: ParseResult & { receiptImage: string }) {
    const items = data.items.map((item) => ({
      ...item,
      id: item.id || uuid(),
      splitMode: (item.quantity > 1 ? 'quantity' : 'percentage') as BillItem['splitMode'],
    }))

    update({
      restaurantName: data.restaurantName,
      currency: data.currency,
      receiptTotal: data.receiptTotal,
      receiptImage: data.receiptImage,
      items,
      status: 'editing',
    })
  }

  function handleManualEntry() {
    update({ status: 'editing' })
  }

  async function handleConfirmBill() {
    // Generate title in background (don't block)
    if (!session!.title) {
      callFunction<{ title: string }>('generate-payment-description', {
        restaurantName: session!.restaurantName,
        items: session!.items.map((i) => ({ name: i.name, originalName: i.originalName })),
        hour: new Date().getHours(),
      }).then((res) => update({ title: res.title })).catch(() => {
        // Fallback: use restaurant name
        const fallback = (session!.restaurantName || 'RESTAURACE')
          .toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^A-Z0-9 \-]/g, '').slice(0, 40)
        update({ title: fallback })
      })
    }

    // If non-CZK, fetch exchange rate
    if (session!.currency !== 'CZK') {
      try {
        const rate = await callFunction<{ rate: number; date: string }>('exchange-rate', {
          currency: session!.currency,
        })
        update({ exchangeRate: rate.rate, exchangeRateDate: rate.date })
      } catch {
        // Continue without conversion — user can handle manually
      }
    }
    setShowParticipants(true)
  }

  function handleParticipantsConfirm() {
    if (session!.participants.length < 2) return
    setStatus('splitting')
  }

  function handleContinue(participantId: string) {
    navigate(`/ucet/${session!.id}/rozdeleni?p=${participantId}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {session.restaurantName || 'Nový účet'}
        </h1>
        <button onClick={() => navigate('/')} className="text-muted text-sm">
          Domů
        </button>
      </div>

      {!account && session.status === 'scanning' && (
        <div className="bg-warning/10 text-warning text-sm rounded-lg p-3 mb-4">
          <button onClick={() => navigate('/nastaveni')} className="underline">
            Nastavte IBAN
          </button>{' '}
          pro generování QR kódů.
        </div>
      )}

      {session.status === 'scanning' && (
        <div>
          <ReceiptScanner onResult={handleScanResult} />
          <div className="text-center mt-4">
            <button onClick={handleManualEntry} className="text-muted text-sm hover:underline">
              Zadat ručně
            </button>
          </div>
        </div>
      )}

      {session.status === 'editing' && !showParticipants && (
        <BillEditor
          items={session.items}
          receiptTotal={session.receiptTotal}
          tip={session.tip}
          currency={session.currency}
          onItemsChange={setItems}
          onTipChange={setTip}
          onConfirm={handleConfirmBill}
        />
      )}

      {session.status === 'editing' && showParticipants && (
        <div>
          <ParticipantInput
            participants={session.participants}
            onChange={setParticipants}
          />
          <Button
            onClick={handleParticipantsConfirm}
            fullWidth
            className="mt-6"
            disabled={session.participants.length < 2}
          >
            Rozdělit účet ({session.participants.length} osob)
          </Button>
          <button
            onClick={() => setShowParticipants(false)}
            className="w-full text-center text-muted text-sm mt-3"
          >
            Zpět k úpravě účtu
          </button>
        </div>
      )}

      {(session.status === 'splitting' || session.status === 'completed') && (
        <SessionOverview session={session} onContinue={handleContinue} />
      )}
    </div>
  )
}
