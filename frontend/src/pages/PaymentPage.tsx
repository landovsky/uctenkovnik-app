import { useParams, useNavigate } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import { getAccountSettings } from '@/lib/localStorage'
import { calculateParticipantTotal, allocationCost } from '@/lib/allocation'
import QrCode from '@/components/QrCode'
import PaymentSummary from '@/components/PaymentSummary'
import Button from '@/components/ui/Button'

function stripDiacritics(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z0-9 \-]/g, '')
}

export default function PaymentPage() {
  const { id, participantId } = useParams<{ id: string; participantId: string }>()
  const navigate = useNavigate()
  const { session } = useSession(id)

  const account = getAccountSettings()
  const participant = session?.participants.find((p) => p.id === participantId)

  if (!session || !participant) {
    return (
      <div className="text-center py-12">
        <p className="text-muted mb-4">Nenalezeno</p>
        <button onClick={() => navigate('/')} className="text-primary">Domů</button>
      </div>
    )
  }

  const displayCurrency = session.exchangeRate ? 'CZK' : session.currency
  const total = calculateParticipantTotal(
    participant.id,
    session.items,
    session.allocations,
    session.tip,
    session.tipMethod,
    session.participants.length,
    session.exchangeRate,
  )

  const myAllocations = session.allocations.filter((a) => a.participantId === participantId)
  const itemsMap = new Map(session.items.map((i) => [i.id, i]))
  const subtotal = myAllocations.reduce((s, a) => {
    const item = itemsMap.get(a.itemId)
    return item ? s + allocationCost(item, a) : s
  }, 0)
  const billSubtotal = session.items.reduce((s, i) => s + i.totalPrice, 0)
  let tipShare = 0
  if (session.tip > 0 && session.participants.length > 0) {
    tipShare = session.tipMethod === 'equal'
      ? session.tip / session.participants.length
      : billSubtotal > 0 ? session.tip * (subtotal / billSubtotal) : 0
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{participant.name}</h1>
        <button onClick={() => navigate(`/ucet/${id}`)} className="text-muted text-sm">
          Přehled
        </button>
      </div>

      <PaymentSummary
        items={session.items}
        allocations={session.allocations}
        participantId={participant.id}
        tipShare={tipShare}
        total={total}
        currency={displayCurrency}
        originalCurrency={session.currency}
        exchangeRate={session.exchangeRate}
      />

      <div className="mt-6 flex justify-center">
        {!account ? (
          <div className="text-center py-4">
            <p className="text-warning text-sm mb-2">IBAN není nastaven</p>
            <button onClick={() => navigate('/nastaveni')} className="text-primary text-sm">
              Nastavit
            </button>
          </div>
        ) : (
          <QrCode
            params={{
              iban: account.iban,
              amount: total,
              currency: displayCurrency,
              message: `${stripDiacritics((session.title || session.restaurantName || '').toUpperCase())} - ${stripDiacritics((participant.name || '').toUpperCase())}`.slice(0, 60),
              recipientName: account.holderName,
            }}
          />
        )}
      </div>

      <Button
        onClick={() => navigate(`/ucet/${id}`)}
        fullWidth
        className="mt-6"
      >
        Hotovo
      </Button>
    </div>
  )
}
