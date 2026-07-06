import Link from 'next/link'
import type { CaseFull } from '@/lib/domains/cases/types'
import { buildCaseSlides, splitCaseBodyAfterContext } from '@/lib/portfolio/case-content'
import { portfolioLabels } from '@/lib/portfolio/copy'
import { CaseImageCarousel } from './CaseImageCarousel'
import { PortfolioNav } from './PortfolioNav'

function youtubeEmbedUrl(url: string): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`
    }
    const id = u.searchParams.get('v')
    if (id) return `https://www.youtube.com/embed/${id}`
  } catch {
    return null
  }
  return null
}

interface Props {
  data: CaseFull
  contactName?: string
  contactEmail?: string
}

export function CaseDetailView({ data, contactName, contactEmail }: Props) {
  const embed = youtubeEmbedUrl(data.youtube_url)
  const slides = buildCaseSlides(data.cover_path, data.media, data.body_html)
  const { leadHtml, restHtml } = splitCaseBodyAfterContext(data.body_html)

  return (
    <>
      <PortfolioNav name={contactName ?? 'Eduardo Damasceno'} />

      <article className="min-h-screen pt-12 sm:pt-16 pb-20">
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <Link
            href="/#projetos"
            className="text-sm text-[var(--pf-muted-3)] hover:text-[var(--pf-text)] transition mb-12 inline-flex items-center gap-2"
          >
            {portfolioLabels.backToProjects}
          </Link>

          <header className="mb-10">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--pf-text)] leading-tight">
              {data.title}
            </h1>
            {data.subtitle && (
              <p className="text-lg sm:text-xl text-[var(--pf-muted-3)] mt-3 font-light">
                {data.subtitle}
              </p>
            )}
          </header>

          {leadHtml ? (
            <div className="case-body" dangerouslySetInnerHTML={{ __html: leadHtml }} />
          ) : null}

          {slides.length > 0 && <CaseImageCarousel slides={slides} title={data.title} />}

          {embed && (
            <div className="aspect-video mb-12 rounded-2xl overflow-hidden bg-black">
              <iframe
                src={embed}
                title={data.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {restHtml ? (
            <div className="case-body" dangerouslySetInnerHTML={{ __html: restHtml }} />
          ) : !leadHtml && !slides.length && !embed ? (
            <p className="text-[var(--pf-muted-3)] text-sm">{portfolioLabels.contentMissing}</p>
          ) : null}
        </div>
      </article>
    </>
  )
}
