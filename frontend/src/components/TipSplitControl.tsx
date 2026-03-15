import type { TipMethod } from '@/types/session'

interface Props {
  method: TipMethod
  onChange: (method: TipMethod) => void
  tip: number
}

export default function TipSplitControl({ method, onChange, tip }: Props) {
  if (tip <= 0) return null

  return (
    <div className="flex items-center gap-3 text-sm py-2">
      <span className="text-muted">Spropitné ({tip.toFixed(0)}):</span>
      <button
        onClick={() => onChange('proportional')}
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          method === 'proportional'
            ? 'bg-primary text-white'
            : 'bg-surface-alt text-gray-600'
        }`}
      >
        Poměrně
      </button>
      <button
        onClick={() => onChange('equal')}
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          method === 'equal'
            ? 'bg-primary text-white'
            : 'bg-surface-alt text-gray-600'
        }`}
      >
        Rovným dílem
      </button>
    </div>
  )
}
