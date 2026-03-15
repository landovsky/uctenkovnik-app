import type { Session } from '@/types/session'
import { getUnallocatedTotal } from '@/lib/allocation'

interface Props {
  session: Session
  onContinue: (participantId: string) => void
}

export default function SessionOverview({ session, onContinue }: Props) {
  const unallocated = getUnallocatedTotal(session.items, session.allocations)

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
                  {p.totalAmount} {session.currency}
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
    </div>
  )
}
