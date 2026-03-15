const MAX_DIMENSION = 1200
const JPEG_QUALITY = 0.6
const MAX_BASE64_SIZE = 950_000 // Stay under DO Functions 1MB body limit

/**
 * Compresses an image file to JPEG, resizes to fit within dimension limits,
 * and ensures the base64 output stays under the server payload limit.
 */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const scale = MAX_DIMENSION / Math.max(width, height)
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      let quality = JPEG_QUALITY
      let base64 = canvasToBase64(canvas, quality)

      // Reduce quality progressively if still too large
      while (base64.length > MAX_BASE64_SIZE && quality > 0.2) {
        quality -= 0.1
        base64 = canvasToBase64(canvas, quality)
      }

      // If still too large, scale down dimensions
      if (base64.length > MAX_BASE64_SIZE) {
        const scale = Math.sqrt(MAX_BASE64_SIZE / base64.length)
        canvas.width = Math.round(width * scale)
        canvas.height = Math.round(height * scale)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        base64 = canvasToBase64(canvas, 0.5)
      }

      resolve(base64)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Nepodařilo se načíst obrázek'))
    }

    img.src = url
  })
}

function canvasToBase64(canvas: HTMLCanvasElement, quality: number): string {
  return canvas.toDataURL('image/jpeg', quality).split(',')[1]
}
