import type { ResumeData } from '@/lib/types'
import { DarkModeToggle } from './DarkModeToggle'

interface Props {
  data: ResumeData
  isPrint?: boolean
}

export function CVTemplate({ data, isPrint = false }: Props) {
  const { profile, experiences, skills, education } = data

  if (!profile) return null

  // Split "Designer de Produto | UX/UI | Inovação" into header tags
  const headerTags = profile.title
    ? profile.title.split('|').map((t) => t.trim()).filter(Boolean)
    : []

  // First paragraph of summary shown in header as bio
  const summaryParagraphs = profile.summary
    ? profile.summary.split('\n').map((p) => p.trim()).filter(Boolean)
    : []
  const heroBio = summaryParagraphs[0] ?? ''
  const summaryRest = summaryParagraphs.slice(1)

  return (
    <div className="max-w-3xl mx-auto my-10 px-4 sm:px-6 lg:px-10 py-10">

      {/* ── Dark mode toggle ──────────────────────────────────────────── */}
      {!isPrint && (
        <div className="mb-6">
          <DarkModeToggle />
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="text-left mb-10">
        <div className="flex flex-col items-start gap-3">
          <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>

          {heroBio && (
            <p className="text-base text-gray-700 dark:text-gray-300">{heroBio}</p>
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
      {(profile.email || profile.phone || profile.linkedin || profile.location) && (
        <section className="mb-10">
          <SectionTitle>Contato</SectionTitle>
          <div className="space-y-2">
            {profile.location && (
              <p className="text-sm text-gray-600 dark:text-gray-300">{profile.location}</p>
            )}
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="contact-link block">
                {profile.email}
              </a>
            )}
            {profile.phone && (
              <p className="text-sm text-gray-600 dark:text-gray-300">{profile.phone}</p>
            )}
            {profile.linkedin && (
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link inline-flex items-center gap-1"
              >
                <span className="font-medium hover:underline">LinkedIn</span>
                <span className="text-blue-600 dark:text-blue-400 text-sm">→</span>
              </a>
            )}
          </div>
        </section>
      )}

      {/* ── Skills ───────────────────────────────────────────────────── */}
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

      {/* ── Resumo ───────────────────────────────────────────────────── */}
      {summaryRest.length > 0 && (
        <section className="mb-10">
          <SectionTitle>Resumo</SectionTitle>
          <div className="space-y-3">
            {summaryRest.map((p, i) => (
              <p key={i} className="text-sm sm:text-base text-gray-500 dark:text-gray-300">
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
          <div className="grid gap-5 sm:grid-cols-2">
            {experiences.map((exp) => (
              <div key={exp.id} className="p-5">
                <article>
                  <h3 className="text-base font-bold mb-2">
                    {exp.role} — {exp.company}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mb-3">
                    {exp.start_date}
                    {exp.is_current ? ' - Presente' : exp.end_date ? ` - ${exp.end_date}` : ''}
                  </p>
                  {exp.description && (
                    <div className="space-y-1">
                      {exp.description
                        .split('\n')
                        .filter(Boolean)
                        .map((line, i) => (
                          <p key={i} className="text-sm text-gray-600 dark:text-gray-300">
                            {line.replace(/^[-•]\s*/, '')}
                          </p>
                        ))}
                    </div>
                  )}
                </article>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Educação ─────────────────────────────────────────────────── */}
      {education.length > 0 && (
        <section className="mb-10">
          <SectionTitle>Educação</SectionTitle>
          <ul className="list-disc sm:pl-5 pl-4 space-y-1">
            {education.map((edu) => (
              <li key={edu.id} className="text-sm text-gray-700 dark:text-gray-300">
                {edu.title}
                {edu.institution && ` — ${edu.institution}`}
                {edu.description && (
                  <span className="text-gray-500 dark:text-gray-400"> · {edu.description}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!isPrint && (
        <footer className="text-center py-6 text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} {profile.name}. Todos os direitos reservados.
        </footer>
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-semibold border-b border-gray-300 dark:border-gray-700 pb-2 mb-6 text-gray-700 dark:text-gray-200">
      {children}
    </h2>
  )
}
