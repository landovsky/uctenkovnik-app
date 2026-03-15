import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import type { Participant } from '@/types/session'
import Pill from '@/components/ui/Pill'

interface Props {
  participants: Participant[]
  onChange: (participants: Participant[]) => void
}

export default function ParticipantInput({ participants, onChange }: Props) {
  const [name, setName] = useState('')

  function handleAdd() {
    const trimmed = name.trim()
    if (!trimmed) return

    onChange([
      ...participants,
      { id: uuid(), name: trimmed, confirmed: false, totalAmount: 0 },
    ])
    setName('')
  }

  function handleDelete(id: string) {
    onChange(participants.filter((p) => p.id !== id))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div>
      <label className="block mb-1 text-sm font-medium">Účastníci</label>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Jméno"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={handleAdd}
          disabled={!name.trim()}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
        >
          Přidat
        </button>
      </div>

      {participants.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {participants.map((p) => (
            <Pill key={p.id} label={p.name} onDelete={() => handleDelete(p.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
