'use client'

interface Props {
  className?: string
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function ScrollHint({ className = '' }: Props) {
  return (
    <div
      className={`flex flex-col items-center text-[var(--pf-muted-2)] ${className}`}
      aria-hidden
    >
      <ChevronDown className="pf-scroll-chevron -mb-3.5" />
      <ChevronDown className="pf-scroll-chevron -mb-3.5" />
      <ChevronDown className="pf-scroll-chevron" />
    </div>
  )
}
