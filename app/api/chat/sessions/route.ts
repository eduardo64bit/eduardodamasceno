import { NextResponse } from 'next/server'
import { startChatSession } from '@/lib/domains/chat/service'

export const runtime = 'nodejs'

export async function POST() {
  try {
    const session = startChatSession()
    return NextResponse.json({
      sessionId: session.id,
      shortCode: session.shortCode,
      status: session.status,
      expiresAt: session.expiresAt,
    })
  } catch {
    return NextResponse.json({ error: 'Não foi possível iniciar a conversa.' }, { status: 500 })
  }
}
