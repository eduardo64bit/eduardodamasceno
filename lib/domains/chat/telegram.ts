export function isTelegramConfigured(): boolean {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim()
  if (!token || !chatId) return false
  // Deve ser o ID numérico do seu usuário, não o @ do bot
  return /^-?\d+$/.test(chatId)
}

function botToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN not configured')
  return token
}

function ownerChatId(): string {
  const id = process.env.TELEGRAM_CHAT_ID
  if (!id) throw new Error('TELEGRAM_CHAT_ID not configured')
  return id
}

interface TelegramSendResult {
  ok: boolean
  result?: { message_id: number }
}

export async function sendTelegramMessage(
  text: string,
  options?: { replyToMessageId?: number }
): Promise<number | null> {
  if (!isTelegramConfigured()) return null

  const payload: Record<string, unknown> = {
    chat_id: ownerChatId(),
    text,
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
  }
  if (options?.replyToMessageId) {
    payload.reply_parameters = { message_id: options.replyToMessageId }
  }

  const res = await fetch(`https://api.telegram.org/bot${botToken()}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = (await res.json()) as TelegramSendResult
  if (!data.ok || !data.result?.message_id) return null
  return data.result.message_id
}

export async function notifyNewChatSession(input: {
  shortCode: string
  userMessage: string
}): Promise<number | null> {
  const text = [
    `💬 *Nova conversa #${input.shortCode}*`,
    '',
    input.userMessage,
    '',
    '_Responda nesta mensagem para continuar no site._',
    '_/fim para encerrar a sessão._',
  ].join('\n')

  return sendTelegramMessage(text)
}

export async function notifyOwnerMessageDelivered(shortCode: string) {
  await sendTelegramMessage(`✓ Enviado para #${shortCode}`)
}

export async function notifySessionClosed(shortCode: string, by: 'owner' | 'visitor') {
  const who = by === 'owner' ? 'Edu' : 'visitante'
  await sendTelegramMessage(`Encerrado · #${shortCode} (${who})`)
}

export function verifyTelegramWebhookSecret(header: string | null): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!expected) return true
  return header === expected
}

interface TelegramUpdate {
  message?: {
    message_id: number
    text?: string
    reply_to_message?: { message_id: number; text?: string }
  }
}

export type TelegramWebhookPayload = TelegramUpdate

export function parseOwnerReply(text: string): { close: boolean; body: string } {
  const trimmed = text.trim()
  if (/^\/fim\b/i.test(trimmed)) {
    return { close: true, body: '' }
  }
  return { close: false, body: trimmed }
}

export function extractShortCodeFromNotifyText(text: string | undefined): string | null {
  if (!text) return null
  const match = text.match(/#([2-9A-HJ-NP-Z]{4,6})/i)
  return match ? match[1].toUpperCase() : null
}
