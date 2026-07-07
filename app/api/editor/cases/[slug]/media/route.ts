import { NextResponse } from 'next/server'
import { requireEditorApi } from '@/lib/domains/auth/require-editor-api'
import { saveCaseMediaUpload } from '@/lib/domains/cases/media-storage'
import { getCaseFullBySlug } from '@/lib/domains/cases/queries'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function POST(request: Request, context: RouteContext) {
  const denied = await requireEditorApi()
  if (denied) return denied

  const { slug } = await context.params
  const caseRow = getCaseFullBySlug(slug)
  if (!caseRow) {
    return NextResponse.json({ error: 'Case não encontrado.' }, { status: 404 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Formulário inválido.' }, { status: 400 })
  }

  const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File)
  if (files.length === 0) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
  }

  const uploaded: { path: string }[] = []
  try {
    for (const file of files) {
      if (!file.size) continue
      const path = await saveCaseMediaUpload(slug, file)
      uploaded.push({ path })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha no upload.'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (uploaded.length === 0) {
    return NextResponse.json({ error: 'Nenhum arquivo válido.' }, { status: 400 })
  }

  return NextResponse.json({ uploaded })
}
