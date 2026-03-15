import type { SpdParams } from '@/types/spd'
import { SPD_LIMITS } from '@/types/spd'

const DIACRITICS_MAP: Record<string, string> = {
  'á': 'A', 'č': 'C', 'ď': 'D', 'é': 'E', 'ě': 'E', 'í': 'I',
  'ň': 'N', 'ó': 'O', 'ř': 'R', 'š': 'S', 'ť': 'T', 'ú': 'U',
  'ů': 'U', 'ý': 'Y', 'ž': 'Z',
  'Á': 'A', 'Č': 'C', 'Ď': 'D', 'É': 'E', 'Ě': 'E', 'Í': 'I',
  'Ň': 'N', 'Ó': 'O', 'Ř': 'R', 'Š': 'S', 'Ť': 'T', 'Ú': 'U',
  'Ů': 'U', 'Ý': 'Y', 'Ž': 'Z',
}

export function transliterate(text: string): string {
  return text.replace(/[^\u0000-\u007F]/g, (ch) => DIACRITICS_MAP[ch] ?? '')
}

function sanitizeField(value: string, maxLength: number): string {
  return transliterate(value).toUpperCase().slice(0, maxLength)
}

/**
 * Builds an SPD (Short Payment Descriptor) string for QR Platba.
 * See: https://qr-platba.cz/pro-vyvojare/specifikace-formatu/
 */
export function buildSpdString(params: SpdParams): string {
  const acc = params.iban.replace(/\s/g, '').toUpperCase().slice(0, SPD_LIMITS.ACC)
  const amount = params.amount.toFixed(2).slice(0, SPD_LIMITS.AM)
  const currency = params.currency.toUpperCase().slice(0, SPD_LIMITS.CC)
  const message = sanitizeField(params.message, SPD_LIMITS.MSG)
  const recipientName = sanitizeField(params.recipientName, SPD_LIMITS.RN)

  const parts = [
    'SPD*1.0',
    `ACC:${acc}`,
    `AM:${amount}`,
    `CC:${currency}`,
  ]

  if (message) parts.push(`MSG:${message}`)
  if (recipientName) parts.push(`RN:${recipientName}`)

  return parts.join('*')
}
