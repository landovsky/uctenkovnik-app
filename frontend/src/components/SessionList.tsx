import { useNavigate } from 'react-router-dom'
import type { Session } from '@/types/session'
import { deleteSession } from '@/lib/localStorage'

const STATUS_LABEL: Record<string, string> = {
  scanning: 'Skenování',
  editing: 'Úprava',
  splitting: 'Rozdělování',
  completed: 'Dokončeno',
}

interface Props {
  sessions: Session[]
  onDelete?: (id: string) => void
}

export default function SessionList({ sessions, onDelete }: Props) {
  const navigate = useNavigate()

  if (sessions.length === 0) return null

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (!confirm('Opravdu smazat?')) return
    deleteSession(id)
    onDelete?.(id)
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Historie</h2>
      <div className="space-y-2">
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => navigate(`/ucet/${s.id}`)}
            className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-primary transition-colors relative"
          >
            <div className="flex justify-between items-start">
              <div className="font-medium pr-6">
                {s.restaurantName || 'Nepojmenovaný účet'}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  s.status === 'completed'
                    ? 'bg-success/10 text-success'
                    : 'bg-surface-alt text-muted'
                }`}>
                  {STATUS_LABEL[s.status] ?? s.status}
                </span>
                <span
                  role="button"
                  onClick={(e) => handleDelete(e, s.id)}
                  className="text-muted hover:text-danger text-sm leading-none"
                  aria-label="Smazat účet"
                >
                  &times;
                </span>
              </div>
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
