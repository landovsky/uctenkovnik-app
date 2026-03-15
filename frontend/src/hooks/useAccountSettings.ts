import { useState, useCallback } from 'react'
import type { AccountSettings } from '@/types/session'
import {
  getAccountSettings as load,
  saveAccountSettings as persist,
} from '@/lib/localStorage'

export function useAccountSettings() {
  const [settings, setSettings] = useState<AccountSettings | null>(load)

  const save = useCallback((updated: AccountSettings) => {
    persist(updated)
    setSettings(updated)
  }, [])

  return { settings, save }
}
