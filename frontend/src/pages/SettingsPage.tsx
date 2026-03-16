import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAccountSettings, saveAccountSettings } from '@/lib/localStorage'
import { validateIban, parseCzechAccount, generateCzechIban } from '@/lib/iban'

export default function SettingsPage() {
  const navigate = useNavigate()
  const saved = getAccountSettings()
  const [accountInput, setAccountInput] = useState(saved?.iban ?? '')
  const [holderName, setHolderName] = useState(saved?.holderName ?? '')
  const [error, setError] = useState('')

  function resolveIban(input: string): string | null {
    const trimmed = input.replace(/\s/g, '')

    // Try as Czech account number (e.g. "123456-7890123456/0800" or "7890123456/0800")
    const parsed = parseCzechAccount(trimmed)
    if (parsed) {
      return generateCzechIban(parsed.accountNumber, parsed.bankCode, parsed.prefix)
    }

    // Try as raw IBAN
    const upper = trimmed.toUpperCase()
    if (validateIban(upper)) {
      return upper
    }

    return null
  }

  function handleSave() {
    const iban = resolveIban(accountInput)
    if (!iban) {
      setError('Neplatné číslo účtu. Zadejte ve formátu 123456-7890123456/0800 nebo IBAN.')
      return
    }
    if (!holderName.trim()) {
      setError('Zadejte jméno majitele účtu')
      return
    }
    saveAccountSettings({ iban, holderName: holderName.trim() })
    navigate('/')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nastavení</h1>

      <label className="block mb-1 text-sm font-medium">Číslo účtu</label>
      <input
        type="text"
        value={accountInput}
        onChange={(e) => { setAccountInput(e.target.value); setError('') }}
        placeholder="123456-7890123456/0800"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <p className="text-xs text-muted mb-4">Formát: předčíslí-číslo účtu/kód banky nebo IBAN</p>

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
