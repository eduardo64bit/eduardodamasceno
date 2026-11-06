import { getActiveResume } from '@/lib/db'
import { pdfResponse, renderResumePdf, resumePdfFilename } from '@/lib/cv/pdf/render'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const data = getActiveResume()
  if (!data?.profile) {
    return Response.json({ error: 'Nenhum currículo ativo.' }, { status: 404 })
  }

  const pdf = await renderResumePdf(data)
  return pdfResponse(pdf, resumePdfFilename(data))
}
