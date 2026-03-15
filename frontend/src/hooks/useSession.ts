import { useState, useCallback, useRef, useEffect } from 'react'
import type { Session, BillItem, Participant, Allocation, SessionStatus, TipMethod } from '@/types/session'
import { getSession, saveSession } from '@/lib/localStorage'

const DEBOUNCE_MS = 300

export function useSession(id: string | undefined) {
  const [session, setSession] = useState<Session | null>(() =>
    id ? getSession(id) : null,
  )
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Persist to localStorage with debounce
  useEffect(() => {
    if (!session) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => saveSession(session), DEBOUNCE_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [session])

  const update = useCallback((partial: Partial<Session>) => {
    setSession((prev) => (prev ? { ...prev, ...partial } : null))
  }, [])

  const setStatus = useCallback(
    (status: SessionStatus) => update({ status }),
    [update],
  )

  const setItems = useCallback(
    (items: BillItem[]) => update({ items }),
    [update],
  )

  const setParticipants = useCallback(
    (participants: Participant[]) => update({ participants }),
    [update],
  )

  const setAllocations = useCallback(
    (allocations: Allocation[]) => update({ allocations }),
    [update],
  )

  const setTip = useCallback(
    (tip: number) => update({ tip }),
    [update],
  )

  const setTipMethod = useCallback(
    (tipMethod: TipMethod) => update({ tipMethod }),
    [update],
  )

  return {
    session,
    update,
    setStatus,
    setItems,
    setParticipants,
    setAllocations,
    setTip,
    setTipMethod,
  }
}
