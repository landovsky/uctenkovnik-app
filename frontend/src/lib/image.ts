const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.7

/**
 * Compresses an image file to JPEG, resizes to max 1600px on longest side,
 * and returns a base64 data string (without the data:... prefix).
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

      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
      // Strip the "data:image/jpeg;base64," prefix
      const base64 = dataUrl.split(',')[1]
      resolve(base64)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Nepodařilo se načíst obrázek'))
    }

    img.src = url
  })
}
