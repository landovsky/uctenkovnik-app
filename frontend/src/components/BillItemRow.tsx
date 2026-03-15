import type { BillItem } from '@/types/session'

interface Props {
  item: BillItem
  onChange: (updated: BillItem) => void
  onDelete: () => void
}

export default function BillItemRow({ item, onChange, onDelete }: Props) {
  function handleField(field: keyof BillItem, raw: string) {
    const updated = { ...item }

    if (field === 'name' || field === 'originalName') {
      updated[field] = raw
    } else if (field === 'quantity') {
      updated.quantity = Math.max(1, parseInt(raw) || 1)
      updated.totalPrice = updated.quantity * updated.unitPrice
    } else if (field === 'unitPrice') {
      updated.unitPrice = Math.max(0, parseFloat(raw) || 0)
      updated.totalPrice = updated.quantity * updated.unitPrice
    }

    updated.splitMode = updated.quantity > 1 ? 'quantity' : 'percentage'
    onChange(updated)
  }

  return (
    <tr className="border-b border-gray-100">
      <td className="py-2 pr-2">
        <input
          type="text"
          value={item.name}
          onChange={(e) => handleField('name', e.target.value)}
          className="w-full text-sm border-b border-transparent hover:border-gray-300 focus:border-primary focus:outline-none"
        />
      </td>
      <td className="py-2 px-2 w-16">
        <input
          type="number"
          min={1}
          value={item.quantity}
          onChange={(e) => handleField('quantity', e.target.value)}
          className="w-full text-sm text-center border-b border-transparent hover:border-gray-300 focus:border-primary focus:outline-none"
        />
      </td>
      <td className="py-2 px-2 w-24">
        <input
          type="number"
          min={0}
          step={0.01}
          value={item.unitPrice}
          onChange={(e) => handleField('unitPrice', e.target.value)}
          className="w-full text-sm text-right border-b border-transparent hover:border-gray-300 focus:border-primary focus:outline-none"
        />
      </td>
      <td className="py-2 px-2 w-24 text-sm text-right">
        {item.totalPrice.toFixed(0)}
      </td>
      <td className="py-2 pl-2 w-8">
        <button
          onClick={onDelete}
          className="text-muted hover:text-danger text-sm"
          aria-label="Smazat"
        >
          &times;
        </button>
      </td>
    </tr>
  )
}
