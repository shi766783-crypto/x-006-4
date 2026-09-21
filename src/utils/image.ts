export const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

export const IMAGE_ACCEPT_ATTR = IMAGE_EXTENSIONS.join(',')

export interface ImageValidationResult {
  ok: boolean
  message?: string
}

/**
 * Validate a picked file before reading it into storage.
 * Some OSes report a generic/empty MIME type, so the extension is checked as a fallback.
 */
export function validateImageFile(file: File): ImageValidationResult {
  const typeOk = ACCEPTED_IMAGE_TYPES.includes(file.type)
  const nameOk = IMAGE_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
  if (!typeOk && !nameOk) {
    return {
      ok: false,
      message: `「${file.name}」不是图片文件，仅支持 JPG、PNG、WEBP、GIF 格式`,
    }
  }
  if (file.size === 0) {
    return { ok: false, message: `「${file.name}」内容为空，无法上传` }
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      ok: false,
      message: `「${file.name}」超过 10MB 大小限制，请压缩后再上传`,
    }
  }
  return { ok: true }
}

/** Read a validated image file as a base64 data URL, guarding against read failures. */
export function readImageAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string' && result.startsWith('data:image/')) {
        resolve(result)
      } else {
        reject(new Error(`「${file.name}」读取失败，文件可能已损坏`))
      }
    }
    reader.onerror = () => reject(new Error(`「${file.name}」读取失败，请重试`))
    reader.readAsDataURL(file)
  })
}

export function fileToBase64(file: File): Promise<string> {
  return readImageAsDataURL(file)
}
