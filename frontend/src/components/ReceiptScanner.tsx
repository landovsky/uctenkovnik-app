import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { compressImage } from '@/lib/image'
import { callFunction } from '@/lib/api'
import type { BillItem } from '@/types/session'

interface OcrResult {
  fullText: string
  annotations: Array<{ text: string; boundingBox: unknown }>
}

interface ParseResult {
  restaurantName: string
  currency: string
  receiptTotal: number
  items: BillItem[]
}

interface Props {
  onResult: (data: ParseResult & { receiptImage: string }) => void
}

export default function ReceiptScanner({ onResult }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setLoading(true)
    setError('')

    try {
      const base64 = await compressImage(file)

      const ocr = await callFunction<OcrResult>('ocr-receipt', { image: base64 })

      if (!ocr.fullText) {
        setError('Nepodařilo se přečíst účtenku. Zkuste lepší fotku.')
        setLoading(false)
        return
      }

      const parsed = await callFunction<ParseResult>('parse-receipt', {
        fullText: ocr.fullText,
        annotations: ocr.annotations,
      })

      onResult({ ...parsed, receiptImage: base64 })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Chyba při zpracování účtenky'
      setError(msg === 'Failed to fetch' ? 'Nepodařilo se odeslat fotku. Zkontrolujte připojení k internetu.' : msg)
    } finally {
      setLoading(false)
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="text-center">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onInputChange}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />

      {loading ? (
        <div className="py-12">
          <Spinner className="text-primary mb-3" />
          <p className="text-muted">Zpracovávám účtenku...</p>
        </div>
      ) : (
        <div className="py-12 space-y-3">
          <Button onClick={() => cameraRef.current?.click()} fullWidth>
            Vyfotit účtenku
          </Button>
          <Button onClick={() => galleryRef.current?.click()} fullWidth variant="secondary">
            Vybrat z galerie
          </Button>
        </div>
      )}

      {error && <p className="text-danger text-sm mt-4">{error}</p>}
    </div>
  )
}
