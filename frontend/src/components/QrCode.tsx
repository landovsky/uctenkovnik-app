import { QRCodeSVG } from 'qrcode.react'
import { buildSpdString } from '@/lib/spd'
import type { SpdParams } from '@/types/spd'

interface Props {
  params: SpdParams
  size?: number
}

export default function QrCode({ params, size = 256 }: Props) {
  const spdString = buildSpdString(params)

  return (
    <div className="flex flex-col items-center gap-3">
      <QRCodeSVG value={spdString} size={size} level="M" />
      <p className="text-xs text-muted break-all max-w-xs text-center">
        {spdString}
      </p>
    </div>
  )
}
