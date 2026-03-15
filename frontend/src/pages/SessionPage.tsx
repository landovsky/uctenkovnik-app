import { useParams, useNavigate } from 'react-router-dom'
import { getSession } from '@/lib/localStorage'

export default function SessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const session = id ? getSession(id) : null

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-muted mb-4">Účet nenalezen</p>
        <button onClick={() => navigate('/')} className="text-primary">
          Zpět na hlavní stránku
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {session.restaurantName || 'Nový účet'}
        </h1>
        <button onClick={() => navigate('/')} className="text-muted text-sm">
          Domů
        </button>
      </div>

      <p className="text-muted">
        Stav: {session.status} — plná implementace v další fázi.
      </p>
    </div>
  )
}
