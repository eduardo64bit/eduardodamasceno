import type { ResumeData } from '@/lib/types'

interface Props {
  data: ResumeData
  /** When true, removes interactive UI chrome (dark-mode toggle, etc.) */
  isPrint?: boolean
}

export function CVTemplate({ data, isPrint = false }: Props) {
  const { profile, experiences, skills, education } = data

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto my-10 px-6 text-gray-500">
        Currículo sem perfil cadastrado.
      </div>
    )
  }

  return (
    <div className="cv-print-wrapper max-w-3xl mx-auto my-10 px-4 sm:px-6 lg:px-10 py-10">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold mb-1">{profile.name}</h1>
        <p className="text-lg text-blue-600 font-medium mb-4">{profile.title}</p>

        {/* Contact row */}
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
          {profile.location && (
            <span>{profile.location}</span>
          )}
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="hover:text-gray-800 transition-colors"
            >
              {profile.email}
            </a>
          )}
          {profile.phone && <span>{profile.phone}</span>}
          {profile.linkedin && (
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-800 transition-colors"
            >
              LinkedIn
            </a>
          )}
        </div>
      </header>

      {/* ── Summary ────────────────────────────────────────────────────── */}
      {profile.summary && (
        <section className="mb-10">
          <SectionTitle>Resumo</SectionTitle>
          <div className="space-y-3">
            {profile.summary.split('\n').filter(Boolean).map((p, i) => (
              <p key={i} className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* ── Experience ─────────────────────────────────────────────────── */}
      {experiences.length > 0 && (
        <section className="mb-10">
          <SectionTitle>Experiência</SectionTitle>
          <div className="space-y-8">
            {experiences.map((exp) => (
              <article key={exp.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                  <h3 className="font-bold text-base">
                    {exp.role} — {exp.company}
                  </h3>
                  <span className="text-sm text-gray-400 shrink-0">
                    {exp.start_date}
                    {exp.is_current
                      ? ' — Presente'
                      : exp.end_date
                      ? ` — ${exp.end_date}`
                      : ''}
                  </span>
                </div>
                {exp.description && (
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    {exp.description
                      .split('\n')
                      .filter(Boolean)
                      .map((line, i) => (
                        <li key={i} className="text-sm text-gray-600 leading-relaxed">
                          {line.replace(/^[-•]\s*/, '')}
                        </li>
                      ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Skills ─────────────────────────────────────────────────────── */}
      {skills.length > 0 && (
        <section className="mb-10">
          <SectionTitle>Habilidades</SectionTitle>
          <div className="space-y-4">
            {skills.map((skillGroup) => (
              <div key={skillGroup.id}>
                <p className="text-sm font-semibold text-gray-500 mb-2">
                  {skillGroup.category}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {skillGroup.items.map((item, i) => (
                    <li
                      key={i}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Education ──────────────────────────────────────────────────── */}
      {education.length > 0 && (
        <section className="mb-10">
          <SectionTitle>Educação</SectionTitle>
          <ul className="space-y-3">
            {education.map((edu) => (
              <li key={edu.id}>
                <p className="font-medium text-sm">
                  {edu.title}
                  {edu.institution && (
                    <span className="text-gray-400 font-normal">
                      {' '}— {edu.institution}
                    </span>
                  )}
                </p>
                {edu.description && (
                  <p className="text-sm text-gray-500 mt-0.5">{edu.description}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!isPrint && (
        <footer className="text-center pt-6 text-xs text-gray-400 border-t border-gray-100">
          © {new Date().getFullYear()} {profile.name}. Todos os direitos reservados.
        </footer>
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-6 text-gray-700">
      {children}
    </h2>
  )
}
