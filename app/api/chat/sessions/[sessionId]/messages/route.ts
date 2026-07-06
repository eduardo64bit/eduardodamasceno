import { NextResponse } from 'next/server'
import { CHAT_MESSAGE_MAX_LENGTH } from '@/lib/domains/chat/constants'
import { submitVisitorMessage } from '@/lib/domains/chat/service'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ sessionId: string }>
}

export async function POST(request: Request, context: RouteContext) {
  const { sessionId } = await context.params

  let body: { body?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const text = body.body?.trim()
  if (!text) {
    return NextResponse.json({ error: 'Mensagem vazia.', code: 'EMPTY_MESSAGE' }, { status: 400 })
  }

  if (text.length > CHAT_MESSAGE_MAX_LENGTH) {
    return NextResponse.json(
      { error: 'Máximo de 1000 caracteres.', code: 'MESSAGE_TOO_LONG' },
      { status: 400 }
    )
  }

  try {
    const result = await submitVisitorMessage(sessionId, text)
    return NextResponse.json({
      session: result.session,
      userMessage: result.userMessage,
      autoReply: result.autoReply ?? null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN'
    if (message === 'SESSION_NOT_FOUND') {
      return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 404 })
    }
    if (message === 'MESSAGE_TOO_LONG') {
      return NextResponse.json(
        { error: 'Máximo de 1000 caracteres.', code: 'MESSAGE_TOO_LONG' },
        { status: 400 }
      )
    }
    if (message === 'SESSION_MESSAGE_LIMIT') {
      return NextResponse.json(
        { error: 'Limite de mensagens atingido nesta conversa.', code: 'SESSION_MESSAGE_LIMIT' },
        { status: 429 }
      )
    }
    if (message === 'RATE_LIMIT') {
      return NextResponse.json(
        { error: 'Limite excedido, aguarde um momento antes de enviar outra mensagem.', code: 'RATE_LIMIT' },
        { status: 429 }
      )
    }
    return NextResponse.json({ error: 'Não foi possível enviar a mensagem.' }, { status: 500 })
  }
}
