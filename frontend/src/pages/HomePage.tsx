import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import type { Session } from '@/types/session'
import { saveSession, getSessions } from '@/lib/localStorage'
import SessionList from '@/components/SessionList'
import Button from '@/components/ui/Button'

export default function HomePage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState(() => getSessions())

  function handleNewSession() {
    const session: Session = {
      id: uuid(),
      createdAt: new Date().toISOString(),
      restaurantName: '',
      title: '',
      status: 'scanning',
      currency: 'CZK',
      exchangeRate: null,
      exchangeRateDate: null,
      receiptImage: null,
      items: [],
      tip: 0,
      tipMethod: 'proportional',
      receiptTotal: 0,
      participants: [],
      allocations: [],
    }
    saveSession(session)
    navigate(`/ucet/${session.id}`)
  }

  function handleDelete(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Účtenkovník</h1>
        <button
          onClick={() => navigate('/nastaveni')}
          className="text-muted hover:text-primary text-sm"
        >
          Nastavení
        </button>
      </div>

      <Button onClick={handleNewSession} fullWidth className="mb-8 py-3">
        Nový účet
      </Button>

      <SessionList sessions={sessions} onDelete={handleDelete} />
    </div>
  )
}
