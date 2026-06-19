'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  componentCatalog,
  cssUtilities,
  designSystemMeta,
  layoutTokens,
  motionTokens,
  patterns,
  roadmapNotes,
  tokenGroups,
  typographyScale,
} from '@/lib/portfolio/design-system'
import { PortfolioPrivacyModal } from '../PortfolioPrivacyModal'
import { ThemeToggle } from '../ThemeToggle'
import { usePortfolioTheme } from '../PortfolioThemeProvider'
import { DsSection } from './DsSection'
import { DsSwatch } from './DsSwatch'

const navItems = [
  { id: 'overview', label: 'Visão geral' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'typography', label: 'Tipografia' },
  { id: 'layout', label: 'Layout' },
  { id: 'components', label: 'Componentes' },
  { id: 'patterns', label: 'Padrões' },
  { id: 'motion', label: 'Motion' },
  { id: 'roadmap', label: 'Roadmap' },
] as const

function DemoPanel({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-5 sm:p-6">
      {label ? (
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-[var(--pf-muted-3)]">
          {label}
        </p>
      ) : null}
      {children}
    </div>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface-2)] p-4 text-xs leading-relaxed text-[var(--pf-muted-2)]">
      <code>{children}</code>
    </pre>
  )
}

export function DesignSystemPage() {
  const { mode, resolved } = usePortfolioTheme()
  const [privacyOpen, setPrivacyOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--pf-border)] bg-[var(--pf-sticky-bg)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[80rem] items-center justify-between gap-4 px-6 py-4 sm:px-10">
          <div className="min-w-0">
            <Link
              href="/"
              className="text-sm text-[var(--pf-muted-3)] transition hover:text-[var(--pf-text)]"
            >
              ← Portfólio
            </Link>
            <h1 className="mt-1 truncate text-lg font-medium tracking-tight text-[var(--pf-text)] sm:text-xl">
              Design System
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-xs text-[var(--pf-muted-3)] sm:inline">
              {mode} · {resolved}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[80rem] px-6 pb-16 sm:px-10 sm:pb-24 lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-16">
        <nav
          className="hidden lg:block"
          aria-label="Seções do design system"
        >
          <ul className="sticky top-24 space-y-1 py-8">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="block rounded-lg px-3 py-2 text-sm text-[var(--pf-muted-2)] transition hover:bg-[var(--pf-surface-2)] hover:text-[var(--pf-text)]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 py-8 sm:py-10">
          <DsSection
            id="overview"
            title="Visão geral"
            description="Referência enxuta do portfólio eduardodamasceno.com.br. Tokens em CSS vars no escopo .portfolio-theme; preferência manual light/dark com fallback ao sistema."
          >
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ['Nome', designSystemMeta.name],
                ['Versão', designSystemMeta.version],
                ['Fonte', designSystemMeta.fontFamily],
                ['Escopo', `.portfolio-theme [${designSystemMeta.themeAttribute}]`],
                ['Storage', designSystemMeta.storageKey],
                ['Tokens', `${tokenGroups.reduce((n, g) => n + g.tokens.length, 0)} vars`],
              ].map(([term, value]) => (
                <div key={term} className="rounded-xl border border-[var(--pf-border)] p-4">
                  <dt className="text-xs uppercase tracking-wider text-[var(--pf-muted-3)]">{term}</dt>
                  <dd className="mt-1 text-sm text-[var(--pf-text)]">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8">
              <DemoPanel label="Uso básico">
                <CodeBlock>{`<!-- Escopo do tema -->
<div class="portfolio-theme" data-theme="dark">
  <p class="text-[var(--pf-text)]">...</p>
</div>`}</CodeBlock>
              </DemoPanel>
            </div>
          </DsSection>

          <DsSection
            id="tokens"
            title="Tokens de cor"
            description="Definidos em app/globals.css. Valores mudam com data-theme light/dark."
          >
            <div className="space-y-10">
              {tokenGroups.map((group) => (
                <div key={group.id}>
                  <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-[var(--pf-muted-3)]">
                    {group.label}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {group.tokens.map((token) => (
                      <DsSwatch key={token.cssVar} token={token} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DsSection>

          <DsSection
            id="typography"
            title="Tipografia"
            description="Inter (300–800). Escala responsiva com sm: breakpoints."
          >
            <div className="space-y-6">
              {typographyScale.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-5 sm:p-6"
                >
                  <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-[var(--pf-text)]">{item.label}</p>
                    <code className="text-xs text-[var(--pf-muted-3)]">{item.usage}</code>
                  </div>
                  <p className={item.className}>{item.sample}</p>
                </div>
              ))}
            </div>
          </DsSection>

          <DsSection
            id="layout"
            title="Layout"
            description="Constantes compartilhadas entre home, cases e rodapé."
          >
            <ul className="divide-y divide-[var(--pf-border)] rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)]">
              {layoutTokens.map((item) => (
                <li
                  key={item.label}
                  className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm text-[var(--pf-text)]">{item.label}</span>
                  <code className="text-xs text-[var(--pf-muted-3)]">{item.value}</code>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <DemoPanel label="Superfícies">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-[var(--pf-bg)] p-4 text-center text-xs text-[var(--pf-muted-2)]">
                    --pf-bg
                  </div>
                  <div className="rounded-xl bg-[var(--pf-surface)] p-4 text-center text-xs text-[var(--pf-muted-2)]">
                    --pf-surface
                  </div>
                  <div className="rounded-xl bg-[var(--pf-surface-2)] p-4 text-center text-xs text-[var(--pf-muted-2)]">
                    --pf-surface-2
                  </div>
                </div>
              </DemoPanel>
            </div>
          </DsSection>

          <DsSection
            id="components"
            title="Componentes"
            description="Catálogo vivo — paths relativos à raiz do repo."
          >
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <DemoPanel label="Botões">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--pf-surface-2)] px-6 py-2.5 text-base text-[var(--pf-muted-2)] transition hover:bg-[var(--pf-btn-hover-bg)] hover:text-[var(--pf-btn-hover-text)]"
                  >
                    Pill CTA
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-[var(--pf-border-strong)] px-5 py-2.5 text-sm font-medium text-[var(--pf-text)] transition hover:bg-[var(--pf-btn-hover-bg)] hover:text-[var(--pf-btn-hover-text)]"
                  >
                    Outline
                  </button>
                  <button
                    type="button"
                    className="flex h-11 items-center justify-center rounded-full bg-[var(--pf-chat-send)] px-4 text-sm font-medium text-[var(--pf-chat-send-text)]"
                  >
                    Enviar
                  </button>
                </div>
              </DemoPanel>

              <DemoPanel label="Chat bubble">
                <div className="space-y-3">
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-[1.25rem] rounded-bl-md bg-[var(--pf-chat-surface)] px-4 py-2.5 text-sm text-[var(--pf-chat-text)]">
                      Oi, aqui é o Edu 🤖
                      <p className="mt-0.5 text-[11px] text-[var(--pf-chat-muted)]">(mensagem automática)</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-[1.25rem] rounded-br-md bg-[var(--pf-chat-user)] px-4 py-2.5 text-sm text-[var(--pf-chat-text)]">
                      Olá!
                    </div>
                  </div>
                </div>
              </DemoPanel>

              <DemoPanel label="Glass (.pf-glass)">
                <div className="pf-glass rounded-xl border border-[var(--pf-glass-border)] px-5 py-4 text-sm text-[var(--pf-muted-2)]">
                  Nav e sticky titles usam blur + saturação.
                </div>
              </DemoPanel>

              <DemoPanel label="Modal informacional">
                <button
                  type="button"
                  onClick={() => setPrivacyOpen(true)}
                  className="text-base text-[var(--pf-muted-2)] underline-offset-4 transition hover:text-[var(--pf-text)] hover:underline"
                >
                  Abrir PortfolioPrivacyModal
                </button>
              </DemoPanel>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[var(--pf-border)]">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-[var(--pf-border)] bg-[var(--pf-surface-2)] text-xs uppercase tracking-wider text-[var(--pf-muted-3)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Componente</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Descrição</th>
                    <th className="px-4 py-3 font-medium">Path</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--pf-border)]">
                  {componentCatalog.map((entry) => (
                    <tr key={entry.name} className="bg-[var(--pf-surface)]">
                      <td className="px-4 py-3 font-medium text-[var(--pf-text)]">{entry.name}</td>
                      <td className="px-4 py-3 text-[var(--pf-muted-3)]">{entry.kind}</td>
                      <td className="px-4 py-3 text-[var(--pf-muted-2)]">{entry.description}</td>
                      <td className="px-4 py-3">
                        <code className="text-xs text-[var(--pf-muted-3)]">{entry.path}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8">
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-[var(--pf-muted-3)]">
                Utilitários CSS
              </h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {cssUtilities.map((util) => (
                  <li
                    key={util.name}
                    className="rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4"
                  >
                    <code className="text-sm text-[var(--pf-text)]">{util.name}</code>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--pf-muted-2)]">
                      {util.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </DsSection>

          <DsSection
            id="patterns"
            title="Padrões de UI"
            description="Regras de produto já aplicadas no portfólio."
          >
            <div className="grid gap-4">
              {patterns.map((pattern) => (
                <article
                  key={pattern.id}
                  className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-5 sm:p-6"
                >
                  <h3 className="text-base font-medium text-[var(--pf-text)]">{pattern.label}</h3>
                  <p className="mt-2 text-sm text-[var(--pf-muted-2)]">{pattern.when}</p>
                  <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                    <div>
                      <dt className="text-[var(--pf-muted-3)]">Exemplo</dt>
                      <dd className="text-[var(--pf-muted-2)]">{pattern.example}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--pf-muted-3)]">Desktop</dt>
                      <dd className="text-[var(--pf-muted-2)]">{pattern.desktop}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-[var(--pf-muted-3)]">Mobile</dt>
                      <dd className="text-[var(--pf-muted-2)]">{pattern.mobile}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </DsSection>

          <DsSection
            id="motion"
            title="Motion"
            description="Animações respeitam prefers-reduced-motion."
          >
            <ul className="divide-y divide-[var(--pf-border)] rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)]">
              {motionTokens.map((item) => (
                <li
                  key={item.label}
                  className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm text-[var(--pf-text)]">{item.label}</span>
                  <code className="text-xs text-[var(--pf-muted-3)]">{item.value}</code>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <DemoPanel label="Typing indicator">
                <span className="inline-flex items-center gap-1.5 rounded-[1.25rem] bg-[var(--pf-chat-surface)] px-4 py-3">
                  <span className="pf-chat-typing-dot" />
                  <span className="pf-chat-typing-dot" />
                  <span className="pf-chat-typing-dot" />
                </span>
              </DemoPanel>
            </div>
          </DsSection>

          <DsSection
            id="roadmap"
            title="Roadmap"
            description="Próximos passos — CV e CVMKR convergem para este sistema."
          >
            <ul className="space-y-3">
              {roadmapNotes.map((note) => (
                <li
                  key={note}
                  className="flex gap-3 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 py-3 text-sm text-[var(--pf-muted-2)]"
                >
                  <span className="text-[var(--pf-muted-3)]" aria-hidden>
                    →
                  </span>
                  {note}
                </li>
              ))}
            </ul>
          </DsSection>
        </main>
      </div>

      <PortfolioPrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </>
  )
}
