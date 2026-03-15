import type { BillItem, Allocation, TipMethod } from '@/types/session'
import { roundCurrency } from './rounding'

/**
 * Returns the remaining available quantity for an item.
 * Optionally excludes a participant (for editing their own allocation).
 */
export function getAvailableQuantity(
  item: BillItem,
  allocations: Allocation[],
  excludeParticipantId?: string,
): number {
  const claimed = allocations
    .filter(
      (a) =>
        a.itemId === item.id &&
        a.type === 'quantity' &&
        a.participantId !== excludeParticipantId,
    )
    .reduce((sum, a) => sum + a.value, 0)

  return Math.max(0, item.quantity - claimed)
}

/**
 * Returns the remaining available percentage for an item (0–100).
 * Optionally excludes a participant.
 */
export function getAvailablePercentage(
  item: BillItem,
  allocations: Allocation[],
  excludeParticipantId?: string,
): number {
  const claimed = allocations
    .filter(
      (a) =>
        a.itemId === item.id &&
        a.type === 'percentage' &&
        a.participantId !== excludeParticipantId,
    )
    .reduce((sum, a) => sum + a.value, 0)

  return Math.max(0, 100 - claimed)
}

/**
 * Calculates the cost of a single allocation entry.
 */
export function allocationCost(item: BillItem, allocation: Allocation): number {
  if (allocation.type === 'quantity') {
    return allocation.value * item.unitPrice
  }
  // percentage: value is % of one unit's price
  return (allocation.value / 100) * item.unitPrice
}

/**
 * Calculates a participant's total share including tip.
 */
export function calculateParticipantTotal(
  participantId: string,
  items: BillItem[],
  allocations: Allocation[],
  tip: number,
  tipMethod: TipMethod,
  participantCount: number,
  exchangeRate: number | null,
): number {
  const itemsMap = new Map(items.map((item) => [item.id, item]))

  const subtotal = allocations
    .filter((a) => a.participantId === participantId)
    .reduce((sum, a) => {
      const item = itemsMap.get(a.itemId)
      return item ? sum + allocationCost(item, a) : sum
    }, 0)

  let tipShare = 0
  if (tip > 0 && participantCount > 0) {
    if (tipMethod === 'equal') {
      tipShare = tip / participantCount
    } else {
      const billSubtotal = items.reduce((s, i) => s + i.totalPrice, 0)
      tipShare = billSubtotal > 0 ? tip * (subtotal / billSubtotal) : 0
    }
  }

  const total = subtotal + tipShare
  const converted = exchangeRate ? total * exchangeRate : total

  return roundCurrency(converted)
}

/**
 * Returns the total amount not yet allocated across all items.
 */
export function getUnallocatedTotal(
  items: BillItem[],
  allocations: Allocation[],
): number {
  let unallocated = 0

  for (const item of items) {
    const itemAllocations = allocations.filter((a) => a.itemId === item.id)

    if (item.splitMode === 'quantity') {
      const claimedQty = itemAllocations
        .filter((a) => a.type === 'quantity')
        .reduce((s, a) => s + a.value, 0)
      unallocated += Math.max(0, item.quantity - claimedQty) * item.unitPrice
    } else {
      const claimedPct = itemAllocations
        .filter((a) => a.type === 'percentage')
        .reduce((s, a) => s + a.value, 0)
      unallocated += ((100 - Math.min(100, claimedPct)) / 100) * item.unitPrice
    }
  }

  return unallocated
}
