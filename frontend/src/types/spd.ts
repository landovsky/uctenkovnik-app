export interface SpdParams {
  iban: string
  amount: number
  currency: string
  message: string
  recipientName: string
}

export interface SpdFieldLimits {
  ACC: number
  AM: number
  CC: number
  MSG: number
  RN: number
}

export const SPD_LIMITS: SpdFieldLimits = {
  ACC: 46,
  AM: 10,
  CC: 3,
  MSG: 60,
  RN: 35,
}
