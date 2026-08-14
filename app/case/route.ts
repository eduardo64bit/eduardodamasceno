import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const html = await readFile(
      path.join(process.cwd(), 'public', 'case', 'index.html'),
      'utf8'
    )

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    })
  } catch {
    return new Response('Apresentação indisponível.', { status: 503 })
  }
}
