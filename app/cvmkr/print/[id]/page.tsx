import { getResumeById } from '@/lib/db'
import { CVTemplate } from '@/components/CVTemplate'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PrintPage({ params }: Props) {
  const { id } = await params
  const data = await getResumeById(id)

  if (!data) notFound()

  return (
    <>
      <style>{`
        @page { margin: 1.5cm; }
        body { background: white !important; }
      `}</style>

      {/* Auto-print trigger */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.addEventListener('load', () => window.print())`,
        }}
      />

      <CVTemplate data={data} isPrint />
    </>
  )
}
