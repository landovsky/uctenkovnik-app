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
