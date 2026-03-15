import type { BillItem, Allocation } from '@/types/session'

interface Props {
  item: BillItem
  allocation: Allocation | undefined
  available: number
  onChange: (value: number) => void
}

export default function AllocationRow({ item, allocation, available, onChange }: Props) {
  const current = allocation?.value ?? 0
  // available = item.quantity - othersClaimed (excludes current participant)
  // so available IS the max this participant can claim
  const maxValue = available
  const fullyTaken = maxValue === 0 && current === 0

  if (item.splitMode === 'quantity') {
    return (
      <tr className={`border-b border-gray-100${fullyTaken ? ' opacity-40' : ''}`}>
        <td className="py-2 pr-2 text-sm align-top">
          <div>{item.name}</div>
          {item.originalName && item.originalName !== item.name && (
            <div className="text-xs text-muted">{item.originalName}</div>
          )}
          <div className="text-xs text-muted">{item.quantity}× {item.unitPrice.toFixed(0)}</div>
        </td>
        <td className="py-2 px-2 align-top">
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              disabled={current <= 0}
              onClick={() => onChange(current - 1)}
              className="w-8 h-8 rounded-full border border-gray-300 text-lg font-bold flex items-center justify-center disabled:opacity-30"
            >−</button>
            <span className="w-8 text-sm text-center font-medium">{current}</span>
            <button
              type="button"
              disabled={current >= maxValue}
              onClick={() => onChange(current + 1)}
              className="w-8 h-8 rounded-full border border-gray-300 text-lg font-bold flex items-center justify-center disabled:opacity-30"
            >+</button>
          </div>
        </td>
        <td className="py-2 pl-2 text-sm text-right align-top">
          {(current * item.unitPrice).toFixed(0)}
        </td>
      </tr>
    )
  }

  // Percentage mode
  return (
    <tr className={`border-b border-gray-100${fullyTaken ? ' opacity-40' : ''}`}>
      <td className="py-2 pr-2 text-sm align-top">
        <div>{item.name}</div>
        {item.originalName && item.originalName !== item.name && (
          <div className="text-xs text-muted">{item.originalName}</div>
        )}
        <div className="text-xs text-muted">{item.unitPrice.toFixed(0)}</div>
      </td>
      <td className="py-2 px-2 align-top">
        <div className="flex items-center gap-1">
          <input
            type="range"
            min={0}
            max={100}
            step={10}
            value={current}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0
              onChange(Math.min(maxValue, val))
            }}
            className="flex-1 min-w-0"
          />
          <span className="text-xs text-muted w-8 text-right shrink-0">{current}%</span>
        </div>
      </td>
      <td className="py-2 pl-2 text-sm text-right align-top">
        {((current / 100) * item.unitPrice).toFixed(0)}
      </td>
    </tr>
  )
}
