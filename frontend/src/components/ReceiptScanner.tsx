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
  const fileRef = useRef<HTMLInputElement>(null)

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
      setError(e instanceof Error ? e.message : 'Chyba při zpracování účtenky')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-center">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {loading ? (
        <div className="py-12">
          <Spinner className="text-primary mb-3" />
          <p className="text-muted">Zpracovávám účtenku...</p>
        </div>
      ) : (
        <div className="py-12">
          <Button onClick={() => fileRef.current?.click()} fullWidth>
            Vyfotit účtenku
          </Button>
          <p className="text-muted text-sm mt-3">
            nebo vyberte fotku z galerie
          </p>
        </div>
      )}

      {error && <p className="text-danger text-sm mt-4">{error}</p>}
    </div>
  )
}
