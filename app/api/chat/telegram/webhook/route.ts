import { NextResponse } from 'next/server'
import { handleTelegramWebhook } from '@/lib/domains/chat/service'
import { verifyTelegramWebhookSecret, type TelegramWebhookPayload } from '@/lib/domains/chat/telegram'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const secret = request.headers.get('x-telegram-bot-api-secret-token')
  if (!verifyTelegramWebhookSecret(secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let update: TelegramWebhookPayload
  try {
    update = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  await handleTelegramWebhook(update)
  return NextResponse.json({ ok: true })
}
