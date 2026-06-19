import type { DesignToken } from '@/lib/portfolio/design-system'

export function DsSwatch({ token }: { token: DesignToken }) {
  return (
    <div className="flex items-stretch gap-3 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-3">
      <div
        className="h-12 w-12 shrink-0 rounded-lg border border-[var(--pf-border)]"
        style={{ background: `var(${token.cssVar})` }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--pf-text)]">{token.name}</p>
        <code className="mt-0.5 block truncate text-xs text-[var(--pf-muted-3)]">{token.cssVar}</code>
        <p className="mt-1 text-xs leading-relaxed text-[var(--pf-muted-2)]">{token.description}</p>
      </div>
    </div>
  )
}
