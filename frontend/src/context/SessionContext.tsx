import { createContext, useContext } from 'react'
import type { Session, BillItem, Participant, Allocation, SessionStatus, TipMethod } from '@/types/session'

interface SessionContextValue {
  session: Session | null
  update: (partial: Partial<Session>) => void
  setStatus: (status: SessionStatus) => void
  setItems: (items: BillItem[]) => void
  setParticipants: (participants: Participant[]) => void
  setAllocations: (allocations: Allocation[]) => void
  setTip: (tip: number) => void
  setTipMethod: (tipMethod: TipMethod) => void
}

export const SessionContext = createContext<SessionContextValue | null>(null)

export function useSessionContext(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSessionContext must be used within SessionContext.Provider')
  return ctx
}
