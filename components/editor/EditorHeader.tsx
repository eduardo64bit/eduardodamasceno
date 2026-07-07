import Link from 'next/link'

interface Props {
  title: string
  backHref?: string
  backLabel?: string
  trailing?: React.ReactNode
}

export function EditorHeader({ title, backHref, backLabel = 'Editor', trailing }: Props) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {backHref ? (
            <Link
              href={backHref}
              className="text-gray-400 hover:text-gray-800 transition shrink-0 text-sm"
            >
              ← {backLabel}
            </Link>
          ) : (
            <span className="font-bold text-gray-900 shrink-0">Editor</span>
          )}
          <span className="text-gray-300 shrink-0">|</span>
          <span className="text-sm text-gray-500 truncate">{title}</span>
        </div>
        {trailing ? <div className="flex items-center gap-3 shrink-0">{trailing}</div> : null}
      </div>
    </header>
  )
}
