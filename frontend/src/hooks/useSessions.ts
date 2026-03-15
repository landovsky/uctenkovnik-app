import { useMemo } from 'react'
import { getSessions } from '@/lib/localStorage'
import type { Session } from '@/types/session'

export function useSessions(): Session[] {
  return useMemo(() => getSessions(), [])
}
