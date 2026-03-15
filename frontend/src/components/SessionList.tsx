import { useNavigate } from 'react-router-dom'
import type { Session } from '@/types/session'

const STATUS_LABEL: Record<string, string> = {
  scanning: 'Skenování',
  editing: 'Úprava',
  splitting: 'Rozdělování',
  completed: 'Dokončeno',
}

interface Props {
  sessions: Session[]
}

export default function SessionList({ sessions }: Props) {
  const navigate = useNavigate()

  if (sessions.length === 0) return null

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Historie</h2>
      <div className="space-y-2">
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => navigate(`/ucet/${s.id}`)}
            className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-primary transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="font-medium">
                {s.restaurantName || 'Nepojmenovaný účet'}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                s.status === 'completed'
                  ? 'bg-success/10 text-success'
                  : 'bg-surface-alt text-muted'
              }`}>
                {STATUS_LABEL[s.status] ?? s.status}
              </span>
            </div>
            <div className="text-sm text-muted mt-1">
              {new Date(s.createdAt).toLocaleDateString('cs-CZ')}
              {s.items.length > 0 && ` · ${s.items.length} položek`}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
