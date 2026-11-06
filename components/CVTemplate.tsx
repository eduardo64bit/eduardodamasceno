import type { Education, ResumeData } from '@/lib/types'

interface Props {
  data: ResumeData
  isPrint?: boolean
}

export function CVTemplate({ data, isPrint = false }: Props) {
  const { profile, experiences, authorProjects, skills, education } = data

  if (!profile) return null

  // Split "Designer de Produto | UX/UI | Inovação" into header tags
  const headerTags = profile.descriptor
    ? profile.descriptor.split('|').map((t) => t.trim()).filter(Boolean)
    : []

  // First paragraph of summary shown in header as bio
  const summaryParagraphs = profile.summary
    ? profile.summary.split('\n').map((p) => p.trim()).filter(Boolean)
    : []

  return (
    <div className="sheet pb-10 pt-6 text-gray-900 dark:text-gray-100 print:text-black">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="text-left mb-10">
        <div className="flex flex-col items-start gap-3">
          <h1 className="text-4xl font-bold text-gray-950 dark:text-gray-50">{profile.name}</h1>

          {profile.title && (
            <p className="text-2xl font-medium text-gray-700 dark:text-gray-200">
              {profile.title}
            </p>
          )}

          {headerTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {headerTags.map((tag, i) => (
                <span key={i} className="pill">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ── Contato ──────────────────────────────────────────────────── */}
      {(profile.email ||
        profile.phone ||
        profile.linkedin ||
        profile.portfolio ||
        profile.location) && (
        <section className="mb-10">
          <SectionTitle>Contato</SectionTitle>
          <div className="grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2 print:grid-cols-2">
            <div className="min-w-0 space-y-2">
              {profile.location && (
                <p className="text-base text-gray-600 dark:text-gray-300">{profile.location}</p>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="contact-link block break-words text-base underline">
                  {profile.email}
                </a>
              )}
              {profile.phone && (
                <p className="text-base text-gray-600 dark:text-gray-300">{profile.phone}</p>
              )}
            </div>
            <div className="min-w-0 space-y-2">
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link block break-all text-base underline print:text-black"
                >
                  {profile.linkedin}
                </a>
              )}
              {profile.portfolio && (
                <a
                  href={profile.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link block break-all text-base underline print:text-black"
                >
                  {profile.portfolio}
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Resumo ───────────────────────────────────────────────────── */}
      {summaryParagraphs.length > 0 && (
        <section className="mb-10">
          <SectionTitle>Resumo</SectionTitle>
          <div className="space-y-3">
            {summaryParagraphs.map((p, i) => (
              <p key={i} className="text-base text-gray-600 dark:text-gray-300">
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* ── Experiência ──────────────────────────────────────────────── */}
      {experiences.length > 0 && (
        <section className="mb-10">
          <SectionTitle>Experiência</SectionTitle>
          <div className="flex flex-col gap-5">
            {experiences.map((exp) => (
              <TimelineEntry
                key={exp.id}
                headline={exp.company}
                subtitle={exp.role}
                startDate={exp.start_date}
                endDate={exp.end_date}
                isCurrent={exp.is_current}
                description={exp.description}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Projetos autorais ────────────────────────────────────────── */}
      {authorProjects.length > 0 && (
        <section className="mb-10">
          <SectionTitle>Projetos autorais</SectionTitle>
          <div className="flex flex-col gap-5">
            {authorProjects.map((project) => (
              <TimelineEntry
                key={project.id}
                headline={project.name}
                subtitle={project.role}
                startDate={project.start_date}
                endDate={project.end_date}
                isCurrent={project.is_current}
                description={project.description}
              />
            ))}
          </div>
        </section>
      )}

      {skills.map((group) => (
        <section key={group.id} className="mb-10">
          <SectionTitle>{group.category}</SectionTitle>
          <ul className="flex flex-wrap gap-2 p-0 list-none">
            {group.items.map((item, i) => (
              <li key={i} className="pill">{item}</li>
            ))}
          </ul>
        </section>
      ))}

      <EducationBlock
        title="Educação"
        items={education.filter((edu) => edu.section !== 'complementary')}
      />
      <EducationBlock
        title="Formação complementar"
        items={education.filter((edu) => edu.section === 'complementary')}
      />

      {!isPrint && (
        <footer className="text-center py-6 text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} {profile.name}. Todos os direitos reservados.
        </footer>
      )}
    </div>
  )
}

function EducationBlock({ title, items }: { title: string; items: Education[] }) {
  if (items.length === 0) return null

  return (
    <section className="mb-10">
      <SectionTitle>{title}</SectionTitle>
      <ul className="space-y-1.5">
        {items.map((edu) => {
          const note =
            edu.description.trim().toLowerCase() === 'formação complementar'
              ? ''
              : edu.description
          return (
            <li key={edu.id} className="flex items-start gap-2.5 text-base text-gray-700 dark:text-gray-300">
              <ArrowMark />
              <span>
                {edu.title}
                {edu.institution && ` - ${edu.institution}`}
                {note && <span className="text-gray-500 dark:text-gray-400"> - {note}</span>}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-semibold border-b border-gray-300 dark:border-gray-700 pb-2 mb-6 text-gray-700 dark:text-gray-200">
      {children}
    </h2>
  )
}

function TimelineEntry({
  headline,
  subtitle,
  startDate,
  endDate,
  isCurrent,
  description,
}: {
  headline: string
  subtitle: string
  startDate: string
  endDate: string | null
  isCurrent: boolean
  description: string
}) {
  return (
    <article>
      <h3 className="text-xl font-bold leading-tight text-gray-950 dark:text-gray-50">{headline}</h3>
      {subtitle && (
        <p className="mt-1 text-base font-medium text-gray-700 dark:text-gray-200">{subtitle}</p>
      )}
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-300 mb-3">
        {startDate}
        {isCurrent ? ' - Presente' : endDate ? ` - ${endDate}` : ''}
      </p>
      {description && <DescriptionBody text={description} />}
    </article>
  )
}

function ArrowMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className="mt-[0.35em] h-3 w-3 shrink-0 text-blue-800 dark:text-blue-200"
    >
      <path d="M3.25 2.15 9.1 6 3.25 9.85 Z" fill="currentColor" />
    </svg>
  )
}

function DescriptionBody({ text }: { text: string }) {
  const blocks: { type: 'p' | 'ul'; items: string[] }[] = []

  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    const bullet = line.match(/^[-•–]\s+(.*)$/)
    if (bullet) {
      const last = blocks[blocks.length - 1]
      if (last?.type === 'ul') last.items.push(bullet[1])
      else blocks.push({ type: 'ul', items: [bullet[1]] })
    } else {
      blocks.push({ type: 'p', items: [line] })
    }
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, i) =>
        block.type === 'ul' ? (
          <ul key={i} className="space-y-1.5">
            {block.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2.5 text-base text-gray-600 dark:text-gray-300">
                <ArrowMark />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i} className="text-base text-gray-600 dark:text-gray-300">
            {block.items[0]}
          </p>
        )
      )}
    </div>
  )
}
