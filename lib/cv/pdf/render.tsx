import { renderToBuffer } from '@react-pdf/renderer'
import type { ResumeData } from '@/lib/types'
import { ResumeDocument } from './ResumeDocument'

export function resumePdfFilename(data: ResumeData): string {
  const person = data.profile?.name || 'Curriculo'
  const version = data.resume.name || 'CV'
  const raw = `${person} ${version}`
  const ascii = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${ascii || 'curriculo'}.pdf`
}

export async function renderResumePdf(data: ResumeData): Promise<Buffer> {
  return renderToBuffer(<ResumeDocument data={data} />)
}

export function pdfResponse(pdf: Buffer, filename: string): Response {
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
