import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAccountSettings, saveAccountSettings } from '@/lib/localStorage'
import { validateIban } from '@/lib/iban'

export default function SettingsPage() {
  const navigate = useNavigate()
  const saved = getAccountSettings()
  const [iban, setIban] = useState(saved?.iban ?? '')
  const [holderName, setHolderName] = useState(saved?.holderName ?? '')
  const [error, setError] = useState('')

  function handleSave() {
    const trimmedIban = iban.replace(/\s/g, '').toUpperCase()
    if (!validateIban(trimmedIban)) {
      setError('Neplatný IBAN')
      return
    }
    if (!holderName.trim()) {
      setError('Zadejte jméno majitele účtu')
      return
    }
    saveAccountSettings({ iban: trimmedIban, holderName: holderName.trim() })
    navigate('/')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nastavení</h1>

      <label className="block mb-1 text-sm font-medium">IBAN</label>
      <input
        type="text"
        value={iban}
        onChange={(e) => { setIban(e.target.value); setError('') }}
        placeholder="CZ65 0800 0000 1920 0014 5399"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <label className="block mb-1 text-sm font-medium">Jméno majitele účtu</label>
      <input
        type="text"
        value={holderName}
        onChange={(e) => { setHolderName(e.target.value); setError('') }}
        placeholder="Jan Novák"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {error && <p className="text-danger text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex-1 py-2 rounded-lg border border-gray-300 hover:bg-surface-alt transition-colors"
        >
          Zpět
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
        >
          Uložit
        </button>
      </div>
    </div>
  )
}
