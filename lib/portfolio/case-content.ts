export interface CaseSlide {
  src: string
  alt: string
  caption: string
}

function normalizeImageKey(url: string): string {
  try {
    return new URL(url, 'https://local').pathname.replace(/\/$/, '')
  } catch {
    return url.split('?')[0]
  }
}

export function extractImagesFromHtml(html: string): CaseSlide[] {
  const seen = new Set<string>()
  const slides: CaseSlide[] = []

  const figureRe = /<figure[^>]*>([\s\S]*?)<\/figure>/gi
  let figureMatch: RegExpExecArray | null
  while ((figureMatch = figureRe.exec(html)) !== null) {
    const block = figureMatch[0]
    const src = block.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]
    if (!src) continue
    const key = normalizeImageKey(src)
    if (seen.has(key)) continue
    seen.add(key)
    const alt = block.match(/<img[^>]+alt=["']([^"']*)["']/i)?.[1] ?? ''
    const caption = block.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1]?.replace(/<[^>]+>/g, '').trim() ?? ''
    slides.push({ src, alt, caption })
  }

  const imgRe = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  let imgMatch: RegExpExecArray | null
  while ((imgMatch = imgRe.exec(html)) !== null) {
    const tag = imgMatch[0]
    const src = imgMatch[1]
    const key = normalizeImageKey(src)
    if (seen.has(key)) continue
    seen.add(key)
    const alt = tag.match(/alt=["']([^"']*)["']/i)?.[1] ?? ''
    slides.push({ src, alt, caption: '' })
  }

  return slides
}

export function stripImagesFromHtml(html: string): string {
  return html
    .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, '')
    .replace(/<img[^>]*\/?>/gi, '')
    .replace(/<p>\s*(?:<br\s*\/?>\s*)*<\/p>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function buildCaseSlides(
  coverPath: string,
  media: { path: string; alt: string; caption: string; sort_order: number }[],
  bodyHtml: string
): CaseSlide[] {
  const seen = new Set<string>()
  const slides: CaseSlide[] = []

  const push = (slide: CaseSlide) => {
    const key = normalizeImageKey(slide.src)
    if (!slide.src || seen.has(key)) return
    seen.add(key)
    slides.push(slide)
  }

  if (coverPath) {
    push({ src: coverPath, alt: '', caption: '' })
  }

  for (const m of [...media].sort((a, b) => a.sort_order - b.sort_order)) {
    push({ src: m.path, alt: m.alt, caption: m.caption })
  }

  for (const slide of extractImagesFromHtml(bodyHtml)) {
    push(slide)
  }

  return slides
}
