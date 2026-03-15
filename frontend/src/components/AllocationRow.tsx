import type { BillItem, Allocation } from '@/types/session'

interface Props {
  item: BillItem
  allocation: Allocation | undefined
  available: number
  onChange: (value: number) => void
}

export default function AllocationRow({ item, allocation, available, onChange }: Props) {
  const current = allocation?.value ?? 0
  const maxValue = current + available

  if (item.splitMode === 'quantity') {
    return (
      <tr className="border-b border-gray-100">
        <td className="py-2 pr-2 text-sm">
          {item.name}
          {item.originalName && item.originalName !== item.name && (
            <div className="text-xs text-muted">{item.originalName}</div>
          )}
        </td>
        <td className="py-2 px-2 text-sm text-muted text-center">{item.quantity}×</td>
        <td className="py-2 px-2 text-sm text-right">{item.unitPrice.toFixed(0)}</td>
        <td className="py-2 px-2 w-28">
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
        <td className="py-2 pl-2 text-sm text-right">
          {(current * item.unitPrice).toFixed(0)}
        </td>
      </tr>
    )
  }

  // Percentage mode
  return (
    <tr className="border-b border-gray-100">
      <td className="py-2 pr-2 text-sm">{item.name}</td>
      <td className="py-2 px-2 text-sm text-muted text-center">1×</td>
      <td className="py-2 px-2 text-sm text-right">{item.unitPrice.toFixed(0)}</td>
      <td className="py-2 px-2 w-32">
        <div className="flex items-center gap-2">
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
            className="flex-1"
          />
          <span className="text-xs text-muted w-10 text-right">{current}%</span>
        </div>
      </td>
      <td className="py-2 pl-2 text-sm text-right">
        {((current / 100) * item.unitPrice).toFixed(0)}
      </td>
    </tr>
  )
}
