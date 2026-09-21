/** MIME types allowed for uploaded report/record photos. */
export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const

/** Value for <input type="file" accept>. */
export const IMAGE_ACCEPT = IMAGE_MIME_TYPES.join(',')

/** Single image size limit (base64 in localStorage inflates ~37%). */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024

/**
 * Validate an upload before it enters the archive.
 * Returns a user-facing error message, or null when the file is acceptable —
 * callers must skip the file when a message is returned so broken entries
 * never render as blank images on the archive page.
 */
export function validateImageFile(file: File): string | null {
  if (!(IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
    return `「${file.name}」不是支持的图片格式，仅支持 JPG / PNG / WebP / GIF`
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return `「${file.name}」超过 5MB 大小限制，请压缩后再上传`
  }
  return null
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
