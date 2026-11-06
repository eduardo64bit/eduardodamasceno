import { getResumeById } from '@/lib/db'
import { pdfResponse, renderResumePdf, resumePdfFilename } from '@/lib/cv/pdf/render'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params
  const data = getResumeById(id)
  if (!data?.profile) {
    return Response.json({ error: 'Currículo não encontrado.' }, { status: 404 })
  }

  const pdf = await renderResumePdf(data)
  return pdfResponse(pdf, resumePdfFilename(data))
}
