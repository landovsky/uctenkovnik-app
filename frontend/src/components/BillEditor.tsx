import { v4 as uuid } from 'uuid'
import type { BillItem } from '@/types/session'
import BillItemRow from './BillItemRow'
import Button from '@/components/ui/Button'

interface Props {
  items: BillItem[]
  receiptTotal: number
  tip: number
  currency: string
  onItemsChange: (items: BillItem[]) => void
  onTipChange: (tip: number) => void
  onConfirm: () => void
}

export default function BillEditor({
  items,
  receiptTotal,
  tip,
  currency,
  onItemsChange,
  onTipChange,
  onConfirm,
}: Props) {
  const itemsTotal = items.reduce((s, i) => s + i.totalPrice, 0)
  const diff = Math.abs(itemsTotal - receiptTotal)

  function handleChange(index: number, updated: BillItem) {
    const next = [...items]
    next[index] = updated
    onItemsChange(next)
  }

  function handleDelete(index: number) {
    onItemsChange(items.filter((_, i) => i !== index))
  }

  function handleAdd() {
    onItemsChange([
      ...items,
      {
        id: uuid(),
        name: '',
        originalName: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        splitMode: 'percentage',
      },
    ])
  }

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted border-b border-gray-200">
            <th className="py-2 pr-2 font-medium">Položka</th>
            <th className="py-2 px-2 font-medium text-center">Ks</th>
            <th className="py-2 px-2 font-medium text-right">Cena/ks</th>
            <th className="py-2 px-2 font-medium text-right">Celkem</th>
            <th className="py-2 pl-2 w-8"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <BillItemRow
              key={item.id}
              item={item}
              onChange={(updated) => handleChange(i, updated)}
              onDelete={() => handleDelete(i)}
            />
          ))}
        </tbody>
      </table>

      <button
        onClick={handleAdd}
        className="text-primary text-sm mt-2 hover:underline"
      >
        + Přidat položku
      </button>

      <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
        <div className="flex justify-between text-sm">
          <span>Mezisoučet</span>
          <span>{itemsTotal.toFixed(0)} {currency}</span>
        </div>

        {receiptTotal > 0 && diff > 1 && (
          <div className="flex justify-between text-sm text-warning">
            <span>Rozdíl oproti účtence</span>
            <span>{diff.toFixed(0)} {currency}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-sm">
          <span>Spropitné</span>
          <input
            type="number"
            min={0}
            value={tip || ''}
            onChange={(e) => onTipChange(Math.max(0, parseFloat(e.target.value) || 0))}
            placeholder="0"
            className="w-24 text-right border-b border-gray-300 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
          <span>Celkem</span>
          <span>{(itemsTotal + tip).toFixed(0)} {currency}</span>
        </div>
      </div>

      <Button onClick={onConfirm} fullWidth className="mt-6">
        Potvrdit a pokračovat
      </Button>
    </div>
  )
}
