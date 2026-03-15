import type { Session, AccountSettings } from '@/types/session'

const SESSION_PREFIX = 'session:'
const ACCOUNT_KEY = 'accountSettings'

export function saveSession(session: Session): void {
  localStorage.setItem(SESSION_PREFIX + session.id, JSON.stringify(session))
}

export function getSession(id: string): Session | null {
  const raw = localStorage.getItem(SESSION_PREFIX + id)
  return raw ? (JSON.parse(raw) as Session) : null
}

export function deleteSession(id: string): void {
  localStorage.removeItem(SESSION_PREFIX + id)
}

export function getSessions(): Session[] {
  const sessions: Session[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(SESSION_PREFIX)) {
      const raw = localStorage.getItem(key)
      if (raw) sessions.push(JSON.parse(raw) as Session)
    }
  }
  return sessions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getAccountSettings(): AccountSettings | null {
  const raw = localStorage.getItem(ACCOUNT_KEY)
  return raw ? (JSON.parse(raw) as AccountSettings) : null
}

export function saveAccountSettings(settings: AccountSettings): void {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(settings))
}
