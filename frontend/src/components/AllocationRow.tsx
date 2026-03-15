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
        <td className="py-2 pr-2 text-sm">{item.name}</td>
        <td className="py-2 px-2 text-sm text-muted text-center">{item.quantity}×</td>
        <td className="py-2 px-2 text-sm text-right">{item.unitPrice.toFixed(0)}</td>
        <td className="py-2 px-2 w-24">
          <input
            type="number"
            min={0}
            max={maxValue}
            value={current}
            onChange={(e) =>
              onChange(Math.min(maxValue, Math.max(0, parseInt(e.target.value) || 0)))
            }
            className="w-full text-sm text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
          />
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
            max={maxValue}
            value={current}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
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
