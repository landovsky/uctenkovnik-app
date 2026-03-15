import type { Participant } from '@/types/session'

interface Props {
  participants: Participant[]
  activeId: string | null
  onSelect: (id: string) => void
}

export default function ParticipantSelector({ participants, activeId, onSelect }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
      {participants.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            p.id === activeId
              ? 'bg-primary text-white'
              : p.confirmed
                ? 'bg-success/10 text-success border border-success/30'
                : 'bg-surface-alt text-gray-700 border border-gray-200'
          }`}
        >
          {p.confirmed && '✓ '}{p.name}
        </button>
      ))}
    </div>
  )
}
