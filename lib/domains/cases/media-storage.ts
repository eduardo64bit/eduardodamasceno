import fs from 'fs'
import path from 'path'
import { getDataDir } from '@/lib/db/paths'

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])
const MAX_BYTES = 10 * 1024 * 1024

export function getCaseMediaDir(slug: string): string {
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, '')
  if (!safeSlug) throw new Error('Slug inválido.')
  return path.join(getDataDir(), 'media', 'cases', safeSlug)
}

export function caseMediaPublicPath(slug: string, filename: string): string {
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, '')
  return `/media/cases/${safeSlug}/${filename}`
}

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i

/** Lista imagens no disco do case (somente servidor). */
export function listCaseMediaPublicPathsOnDisk(slug: string): string[] {
  const dir = getCaseMediaDir(slug)
  if (!fs.existsSync(dir)) return []

  return fs
    .readdirSync(dir)
    .filter((name) => IMAGE_EXT.test(name))
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .map((name) => caseMediaPublicPath(slug, name))
}

function mediaRoot(): string {
  return path.join(getDataDir(), 'media')
}

export function resolveMediaFile(publicPath: string): string | null {
  if (!publicPath.startsWith('/media/')) return null
  const rel = publicPath.replace(/^\/media\/?/, '')
  const segments = rel.split('/').filter(Boolean)
  if (segments.some((s) => s === '..' || s === '.')) return null

  const resolved = path.resolve(mediaRoot(), ...segments)
  if (!resolved.startsWith(path.resolve(mediaRoot()))) return null
  return resolved
}

export function sanitizeUploadFilename(original: string): string {
  const ext = path.extname(original).toLowerCase()
  const base = path
    .basename(original, ext)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

  const stem = base || 'imagem'
  return `${stem}${ALLOWED_EXT.has(ext) ? ext : '.jpg'}`
}

function uniqueFilename(dir: string, filename: string): string {
  const ext = path.extname(filename)
  const stem = path.basename(filename, ext)
  let candidate = filename
  let n = 2
  while (fs.existsSync(path.join(dir, candidate))) {
    candidate = `${stem}-${n}${ext}`
    n += 1
  }
  return candidate
}

export function assertAllowedImage(file: File): void {
  if (file.size > MAX_BYTES) {
    throw new Error(`Arquivo muito grande (máx. ${MAX_BYTES / 1024 / 1024}MB).`)
  }
  const ext = path.extname(file.name).toLowerCase()
  if (!ALLOWED_EXT.has(ext)) {
    throw new Error('Formato não suportado. Use JPG, PNG, WebP ou GIF.')
  }
  const mime = file.type.toLowerCase()
  if (mime && !mime.startsWith('image/')) {
    throw new Error('Arquivo não é uma imagem.')
  }
}

export async function saveCaseMediaUpload(slug: string, file: File): Promise<string> {
  assertAllowedImage(file)
  const dir = getCaseMediaDir(slug)
  fs.mkdirSync(dir, { recursive: true })

  const filename = uniqueFilename(dir, sanitizeUploadFilename(file.name))
  const dest = path.join(dir, filename)
  const buffer = Buffer.from(await file.arrayBuffer())
  fs.writeFileSync(dest, buffer)

  return caseMediaPublicPath(slug, filename)
}

export function deleteCaseMediaFile(publicPath: string): void {
  const resolved = resolveMediaFile(publicPath)
  if (!resolved || !fs.existsSync(resolved)) return
  if (!fs.statSync(resolved).isFile()) return
  fs.unlinkSync(resolved)
}
