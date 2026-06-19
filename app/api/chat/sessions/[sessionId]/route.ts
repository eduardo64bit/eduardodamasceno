import { NextResponse } from 'next/server'
import { closeChatSession, getChatSessionState } from '@/lib/domains/chat/service'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ sessionId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params
  const state = getChatSessionState(sessionId)
  if (!state) {
    return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 404 })
  }
  return NextResponse.json(state)
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params
  await closeChatSession(sessionId, 'visitor')
  return NextResponse.json({ ok: true })
}
