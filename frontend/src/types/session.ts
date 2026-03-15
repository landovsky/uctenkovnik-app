export interface BillItem {
  id: string
  name: string
  originalName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  splitMode: 'quantity' | 'percentage'
}

export interface Participant {
  id: string
  name: string
  confirmed: boolean
  totalAmount: number
}

export interface Allocation {
  participantId: string
  itemId: string
  type: 'quantity' | 'percentage'
  value: number
}

export type SessionStatus = 'scanning' | 'editing' | 'splitting' | 'completed'
export type TipMethod = 'proportional' | 'equal'

export interface Session {
  id: string
  createdAt: string
  restaurantName: string
  title: string
  status: SessionStatus
  currency: string
  exchangeRate: number | null
  exchangeRateDate: string | null
  receiptImage: string | null
  items: BillItem[]
  tip: number
  tipMethod: TipMethod
  receiptTotal: number
  participants: Participant[]
  allocations: Allocation[]
}

export interface AccountSettings {
  iban: string
  holderName: string
}
