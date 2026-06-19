import { publishChatEvent } from './events'
import {
  CHAT_AUTO_REPLY,
  CHAT_MESSAGE_MAX_LENGTH,
  CHAT_RATE_LIMIT_PER_MINUTE,
  CHAT_SESSION_MESSAGE_LIMIT,
} from './constants'
import { refreshOwnerPresence, reconcileSessionPresence } from './presence'
import {
  addChatMessage,
  countUserMessages,
  countUserMessagesInLastMinute,
  createChatSession,
  deleteChatSession,
  getChatSession,
  getChatSessionByShortCode,
  getChatSessionByTelegramNotifyMessageId,
  getTelegramNotifyMessageId,
  hasSessionAutoAck,
  isTelegramNotified,
  listChatMessages,
  markTelegramNotified,
} from './repository'
import {
  extractShortCodeFromNotifyText,
  isTelegramConfigured,
  notifyNewChatSession,
  notifyOwnerMessageDelivered,
  notifySessionClosed,
  parseOwnerReply,
  sendTelegramMessage,
  type TelegramWebhookPayload,
} from './telegram'
import type { ChatMessage, ChatSession } from './types'

export function startChatSession(): ChatSession {
  return createChatSession()
}

export function getChatSessionState(sessionId: string) {
  const session = reconcileSessionPresence(sessionId)
  if (!session) return null
  return {
    session,
    messages: listChatMessages(sessionId),
  }
}

export async function submitVisitorMessage(
  sessionId: string,
  body: string
): Promise<{
  session: ChatSession
  userMessage: ChatMessage
  autoReply?: ChatMessage
}> {
  const session = reconcileSessionPresence(sessionId)
  if (!session) throw new Error('SESSION_NOT_FOUND')

  if (body.length > CHAT_MESSAGE_MAX_LENGTH) throw new Error('MESSAGE_TOO_LONG')

  if (countUserMessages(sessionId) >= CHAT_SESSION_MESSAGE_LIMIT) {
    throw new Error('SESSION_MESSAGE_LIMIT')
  }

  if (countUserMessagesInLastMinute(sessionId) >= CHAT_RATE_LIMIT_PER_MINUTE) {
    throw new Error('RATE_LIMIT')
  }

  const userMessage = addChatMessage({ sessionId, role: 'user', body })
  publishChatEvent(sessionId, { type: 'message', message: userMessage })

  const current = getChatSession(sessionId)!
  if (isTelegramConfigured()) {
    if (!isTelegramNotified(sessionId)) {
      const messageId = await notifyNewChatSession({
        shortCode: current.shortCode,
        userMessage: body,
      })
      if (messageId) markTelegramNotified(sessionId, messageId)
    } else {
      const replyTo = getTelegramNotifyMessageId(sessionId)
      await sendTelegramMessage(`#${current.shortCode}\n${body}`, {
        replyToMessageId: replyTo ?? undefined,
      })
    }
  }

  let autoReply: ChatMessage | undefined
  if (!hasSessionAutoAck(sessionId)) {
    autoReply = addChatMessage({
      sessionId,
      role: 'bot',
      body: CHAT_AUTO_REPLY,
      automated: true,
    })
    publishChatEvent(sessionId, { type: 'message', message: autoReply })
  }

  return {
    session: getChatSession(sessionId)!,
    userMessage,
    autoReply,
  }
}

export async function handleTelegramWebhook(update: TelegramWebhookPayload) {
  const message = update.message
  if (!message?.text) return { handled: false as const }

  const replyToId = message.reply_to_message?.message_id
  const replyToText = message.reply_to_message?.text
  const parsed = parseOwnerReply(message.text)

  let session = null

  if (replyToId) {
    session = getChatSessionByTelegramNotifyMessageId(replyToId)
  }

  if (!session) {
    const code =
      extractShortCodeFromNotifyText(replyToText) ??
      extractShortCodeFromNotifyText(message.text)
    if (code) session = getChatSessionByShortCode(code)
  }

  if (!session) return { handled: false as const }

  if (parsed.close) {
    await closeChatSession(session.id, 'owner')
    return { handled: true as const, action: 'closed' as const }
  }

  const ownerMessage = addChatMessage({
    sessionId: session.id,
    role: 'owner',
    body: parsed.body,
  })
  refreshOwnerPresence(session.id)
  publishChatEvent(session.id, { type: 'message', message: ownerMessage })
  await notifyOwnerMessageDelivered(session.shortCode)

  return { handled: true as const, action: 'message' as const }
}

export async function closeChatSession(sessionId: string, by: 'owner' | 'visitor' = 'visitor') {
  const session = getChatSession(sessionId)
  if (!session) return

  if (by === 'owner' && isTelegramConfigured() && isTelegramNotified(sessionId)) {
    await notifySessionClosed(session.shortCode, by)
  }

  deleteChatSession(sessionId)
}
