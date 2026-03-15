import { useNavigate } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import type { Session } from '@/types/session'
import { saveSession, getSessions } from '@/lib/localStorage'

export default function HomePage() {
  const navigate = useNavigate()

  function handleNewSession() {
    const session: Session = {
      id: uuid(),
      createdAt: new Date().toISOString(),
      restaurantName: '',
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

  const sessions = getSessions()

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

      <button
        onClick={handleNewSession}
        className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors mb-8"
      >
        Nový účet
      </button>

      {sessions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Historie</h2>
          <div className="space-y-2">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/ucet/${s.id}`)}
                className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-primary transition-colors"
              >
                <div className="font-medium">
                  {s.restaurantName || 'Nepojmenovaný účet'}
                </div>
                <div className="text-sm text-muted">
                  {new Date(s.createdAt).toLocaleDateString('cs-CZ')} · {s.status}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
