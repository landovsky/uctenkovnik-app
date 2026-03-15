import type { BillItem, Allocation } from '@/types/session'
import { getAvailableQuantity, getAvailablePercentage } from '@/lib/allocation'
import AllocationRow from './AllocationRow'

interface Props {
  items: BillItem[]
  allocations: Allocation[]
  participantId: string
  onAllocationChange: (itemId: string, value: number) => void
}

export default function AllocationTable({
  items,
  allocations,
  participantId,
  onAllocationChange,
}: Props) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-muted border-b border-gray-200">
          <th className="py-2 pr-2 font-medium">Položka</th>
          <th className="py-2 px-2 font-medium text-center">Moje</th>
          <th className="py-2 pl-2 font-medium text-right">Částka</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const allocation = allocations.find(
            (a) => a.itemId === item.id && a.participantId === participantId,
          )
          const available =
            item.splitMode === 'quantity'
              ? getAvailableQuantity(item, allocations, participantId)
              : getAvailablePercentage(item, allocations, participantId)

          return (
            <AllocationRow
              key={item.id}
              item={item}
              allocation={allocation}
              available={available}
              onChange={(value) => onAllocationChange(item.id, value)}
            />
          )
        })}
      </tbody>
    </table>
  )
}
