/**
 * Validates an IBAN using the MOD 97-10 algorithm (ISO 13616).
 * Input must be uppercase with no spaces.
 */
export function validateIban(iban: string): boolean {
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/.test(iban)) {
    return false
  }

  // Move first 4 chars to end
  const rearranged = iban.slice(4) + iban.slice(0, 4)

  // Replace letters with digits (A=10, B=11, ..., Z=35)
  const digits = rearranged.replace(/[A-Z]/g, (ch) =>
    String(ch.charCodeAt(0) - 55)
  )

  // MOD 97 using iterative approach (avoids BigInt for compatibility)
  let remainder = 0
  for (const char of digits) {
    remainder = (remainder * 10 + Number(char)) % 97
  }

  return remainder === 1
}

function mod97(numStr: string): number {
  let remainder = 0
  for (const char of numStr) {
    remainder = (remainder * 10 + Number(char)) % 97
  }
  return remainder
}

/**
 * Generates a Czech IBAN from account number components.
 * Format: CZ + 2 check digits + 4-digit bank code + 6-digit prefix + 10-digit account number
 * @param accountNumber - Account number (up to 10 digits)
 * @param bankCode - 4-digit bank code
 * @param prefix - Account prefix (up to 6 digits, optional)
 */
export function generateCzechIban(accountNumber: string, bankCode: string, prefix = ''): string {
  const paddedBank = bankCode.padStart(4, '0')
  const paddedPrefix = (prefix || '0').padStart(6, '0')
  const paddedAccount = accountNumber.padStart(10, '0')

  // BBAN = bankCode(4) + prefix(6) + accountNumber(10)
  const bban = paddedBank + paddedPrefix + paddedAccount

  // For check digit: BBAN + "CZ00" converted to digits
  // CZ = C(12) Z(35) => "1235", 00 => "00"
  const numericStr = bban + '123500'
  const remainder = mod97(numericStr)
  const checkDigits = String(98 - remainder).padStart(2, '0')

  return `CZ${checkDigits}${bban}`
}

/**
 * Parses a Czech account number string like "123456-7890123456/0800"
 * or "7890123456/0800" into components.
 */
export function parseCzechAccount(input: string): { prefix: string; accountNumber: string; bankCode: string } | null {
  const cleaned = input.replace(/\s/g, '')
  const match = cleaned.match(/^(?:(\d{1,6})-)?(\d{1,10})\/(\d{4})$/)
  if (!match) return null
  return {
    prefix: match[1] || '',
    accountNumber: match[2],
    bankCode: match[3],
  }
}
