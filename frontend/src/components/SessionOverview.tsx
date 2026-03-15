import type { Session } from '@/types/session'
import { getUnallocatedTotal, allocationCost } from '@/lib/allocation'

interface Props {
  session: Session
  onContinue: (participantId: string) => void
}

export default function SessionOverview({ session, onContinue }: Props) {
  const unallocated = getUnallocatedTotal(session.items, session.allocations)
  const itemsMap = new Map(session.items.map((i) => [i.id, i]))

  const billTotal = session.items.reduce((s, i) => s + i.totalPrice, 0) + session.tip

  const participantTotals = session.participants.map((p) => {
    const subtotal = session.allocations
      .filter((a) => a.participantId === p.id)
      .reduce((s, a) => {
        const item = itemsMap.get(a.itemId)
        return item ? s + allocationCost(item, a) : s
      }, 0)
    let tipShare = 0
    if (session.tip > 0 && session.participants.length > 0) {
      if (session.tipMethod === 'equal') {
        tipShare = session.tip / session.participants.length
      } else {
        const billSubtotal = session.items.reduce((s, i) => s + i.totalPrice, 0)
        tipShare = billSubtotal > 0 ? session.tip * (subtotal / billSubtotal) : 0
      }
    }
    return { ...p, subtotal: subtotal + tipShare }
  })

  const allocated = participantTotals.reduce((s, p) => s + p.subtotal, 0)
  const remainder = billTotal - allocated

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Přehled</h2>

      {unallocated > 1 && (
        <div className="bg-warning/10 text-warning text-sm rounded-lg p-3 mb-4">
          Nerozděleno: {unallocated.toFixed(0)} {session.currency}
        </div>
      )}

      <div className="space-y-2">
        {session.participants.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
          >
            <div className="flex items-center gap-2">
              <span className={p.confirmed ? 'text-success' : 'text-muted'}>
                {p.confirmed ? '✓' : '⏳'}
              </span>
              <span className="font-medium">{p.name}</span>
            </div>
            <div className="flex items-center gap-3">
              {p.totalAmount > 0 && (
                <span className="text-sm text-muted">
                  {p.totalAmount} {session.exchangeRate ? 'CZK' : session.currency}
                </span>
              )}
              {!p.confirmed && (
                <button
                  onClick={() => onContinue(p.id)}
                  className="text-primary text-sm font-medium"
                >
                  Pokračovat
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-surface-alt rounded-lg text-sm space-y-1">
        {participantTotals.map((p) => (
          <div key={p.id} className="flex justify-between">
            <span className="text-muted">{p.name}</span>
            <span>{p.subtotal.toFixed(0)} {session.currency}</span>
          </div>
        ))}
        {remainder > 1 && (
          <div className="flex justify-between text-warning">
            <span>Nerozděleno</span>
            <span>{remainder.toFixed(0)} {session.currency}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold pt-1 border-t border-gray-300">
          <span>Účet celkem</span>
          <span>{billTotal.toFixed(0)} {session.currency}</span>
        </div>
      </div>
    </div>
  )
}
