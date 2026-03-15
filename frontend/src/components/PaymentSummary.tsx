import type { BillItem, Allocation } from '@/types/session'
import { allocationCost } from '@/lib/allocation'

interface Props {
  items: BillItem[]
  allocations: Allocation[]
  participantId: string
  tipShare: number
  total: number
  currency: string
  originalCurrency?: string
  exchangeRate?: number | null
}

export default function PaymentSummary({
  items,
  allocations,
  participantId,
  tipShare,
  total,
  currency,
  originalCurrency,
  exchangeRate,
}: Props) {
  const itemsMap = new Map(items.map((i) => [i.id, i]))
  const myAllocations = allocations.filter(
    (a) => a.participantId === participantId && a.value > 0,
  )

  const hasConversion = !!(exchangeRate && originalCurrency && originalCurrency !== currency)
  const origCur = originalCurrency || currency

  const origSubtotal = myAllocations.reduce((s, a) => {
    const item = itemsMap.get(a.itemId)
    return item ? s + allocationCost(item, a) : s
  }, 0)

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
            <span>{cost.toFixed(0)} {origCur}</span>
          </div>
        )
      })}

      {tipShare > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted">Spropitné</span>
          <span>
            {hasConversion
              ? `${(tipShare / exchangeRate!).toFixed(0)} ${origCur}`
              : `${tipShare.toFixed(0)} ${currency}`}
          </span>
        </div>
      )}

      <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
        <span>Celkem</span>
        <span>
          {hasConversion
            ? `${(origSubtotal + (tipShare > 0 ? tipShare / exchangeRate! : 0)).toFixed(0)} ${origCur}`
            : `${total} ${currency}`}
        </span>
      </div>

      {hasConversion && (
        <>
          <div className="flex justify-between text-sm text-muted pt-1">
            <span>Kurz {origCur}/CZK</span>
            <span>{exchangeRate!.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-primary">
            <span>K úhradě</span>
            <span>{total} {currency}</span>
          </div>
        </>
      )}
    </div>
  )
}
