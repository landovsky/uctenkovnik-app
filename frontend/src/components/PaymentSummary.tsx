import type { BillItem, Allocation } from '@/types/session'
import { allocationCost } from '@/lib/allocation'

interface Props {
  items: BillItem[]
  allocations: Allocation[]
  participantId: string
  tipShare: number
  total: number
  currency: string
}

export default function PaymentSummary({
  items,
  allocations,
  participantId,
  tipShare,
  total,
  currency,
}: Props) {
  const itemsMap = new Map(items.map((i) => [i.id, i]))
  const myAllocations = allocations.filter(
    (a) => a.participantId === participantId && a.value > 0,
  )

  return (
    <div className="space-y-1">
      {myAllocations.map((a) => {
        const item = itemsMap.get(a.itemId)
        if (!item) return null
        const cost = allocationCost(item, a)
        const detail =
          a.type === 'quantity'
            ? `${a.value}× ${item.unitPrice.toFixed(0)}`
            : `${a.value}%`

        return (
          <div key={a.itemId} className="flex justify-between text-sm">
            <span>
              {item.name} <span className="text-muted">({detail})</span>
            </span>
            <span>{cost.toFixed(0)} {currency}</span>
          </div>
        )
      })}

      {tipShare > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted">Spropitné</span>
          <span>{tipShare.toFixed(0)} {currency}</span>
        </div>
      )}

      <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
        <span>Celkem</span>
        <span>{total} {currency}</span>
      </div>
    </div>
  )
}
