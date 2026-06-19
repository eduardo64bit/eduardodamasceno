interface Props {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}

export function DsSection({ id, title, description, children }: Props) {
  return (
    <section
      id={id}
      className="scroll-mt-28 border-t border-[var(--pf-border)] py-12 sm:py-16 first:border-t-0 first:pt-4"
    >
      <h2 className="text-2xl font-medium tracking-tight text-[var(--pf-text)]">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-base font-light leading-relaxed text-[var(--pf-muted-2)]">
          {description}
        </p>
      ) : null}
      <div className="mt-8">{children}</div>
    </section>
  )
}
