import { getDb } from '@/lib/db/client'
import { generateShortCode } from './short-code'
import type { ChatMessage, ChatMessageRole, ChatSession, ChatSessionStatus } from './types'

const SESSION_TTL_MS = 24 * 60 * 60 * 1000

function mapSession(row: {
  id: string
  short_code: string
  status: string
  owner_presence_until?: string | null
  created_at: string
  updated_at: string
  expires_at: string
}): ChatSession {
  const status = row.status as ChatSessionStatus
  const normalizedStatus: ChatSessionStatus =
    status === 'online' ? 'online' : 'offline'

  return {
    id: row.id,
    shortCode: row.short_code,
    status: normalizedStatus,
    ownerPresenceUntil: row.owner_presence_until ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at,
  }
}

function mapMessage(row: {
  id: string
  session_id: string
  role: string
  body: string
  automated: number
  created_at: string
}): ChatMessage {
  return {
    id: row.id,
    sessionId: row.session_id,
    role: row.role as ChatMessageRole,
    body: row.body,
    automated: row.automated === 1,
    createdAt: row.created_at,
  }
}

type SessionRow = {
  id: string
  short_code: string
  status: string
  owner_presence_until?: string | null
  created_at: string
  updated_at: string
  expires_at: string
}

export function purgeExpiredChatSessions() {
  const db = getDb()
  db.prepare(`DELETE FROM chat_sessions WHERE expires_at < datetime('now')`).run()
}

export function getChatSessionByTelegramNotifyMessageId(messageId: number): ChatSession | null {
  purgeExpiredChatSessions()
  const row = getDb()
    .prepare('SELECT * FROM chat_sessions WHERE telegram_notify_message_id = ?')
    .get(messageId) as SessionRow | undefined
  return row ? mapSession(row) : null
}

function uniqueShortCode(): string {
  const db = getDb()
  for (let i = 0; i < 12; i += 1) {
    const code = generateShortCode(i >= 8 ? 6 : 4)
    const exists = db
      .prepare('SELECT 1 FROM chat_sessions WHERE short_code = ?')
      .get(code)
    if (!exists) return code
  }
  return generateShortCode(6)
}

export function createChatSession(): ChatSession {
  purgeExpiredChatSessions()
  const db = getDb()
  const id = crypto.randomUUID()
  const shortCode = uniqueShortCode()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString()

  db.prepare(
    `INSERT INTO chat_sessions (id, short_code, status, expires_at)
     VALUES (?, ?, 'offline', ?)`
  ).run(id, shortCode, expiresAt)

  return mapSession(
    db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(id) as SessionRow
  )
}

export function getChatSession(sessionId: string): ChatSession | null {
  purgeExpiredChatSessions()
  const row = getDb()
    .prepare('SELECT * FROM chat_sessions WHERE id = ?')
    .get(sessionId) as SessionRow | undefined
  return row ? mapSession(row) : null
}

export function getChatSessionByShortCode(shortCode: string): ChatSession | null {
  purgeExpiredChatSessions()
  const row = getDb()
    .prepare('SELECT * FROM chat_sessions WHERE short_code = ? COLLATE NOCASE')
    .get(shortCode.toUpperCase()) as SessionRow | undefined
  return row ? mapSession(row) : null
}

export function setChatSessionStatus(sessionId: string, status: ChatSessionStatus) {
  getDb()
    .prepare(
      `UPDATE chat_sessions
       SET status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ?`
    )
    .run(status, sessionId)
}

export function setOwnerPresenceUntil(sessionId: string, until: string) {
  getDb()
    .prepare(
      `UPDATE chat_sessions
       SET owner_presence_until = ?,
           updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ?`
    )
    .run(until, sessionId)
}

export function clearOwnerPresenceUntil(sessionId: string) {
  getDb()
    .prepare(
      `UPDATE chat_sessions
       SET owner_presence_until = NULL,
           updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ?`
    )
    .run(sessionId)
}

export function markTelegramNotified(sessionId: string, messageId: number) {
  getDb()
    .prepare(
      `UPDATE chat_sessions
       SET telegram_notified = 1,
           telegram_notify_message_id = ?,
           updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ?`
    )
    .run(messageId, sessionId)
}

export function getTelegramNotifyMessageId(sessionId: string): number | null {
  const row = getDb()
    .prepare('SELECT telegram_notify_message_id FROM chat_sessions WHERE id = ?')
    .get(sessionId) as { telegram_notify_message_id: number | null } | undefined
  return row?.telegram_notify_message_id ?? null
}

export function isTelegramNotified(sessionId: string): boolean {
  const row = getDb()
    .prepare('SELECT telegram_notified FROM chat_sessions WHERE id = ?')
    .get(sessionId) as { telegram_notified: number } | undefined
  return row?.telegram_notified === 1
}

export function countUserMessages(sessionId: string): number {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS c FROM chat_messages
       WHERE session_id = ? AND role = 'user'`
    )
    .get(sessionId) as { c: number }
  return row.c
}

export function countUserMessagesInLastMinute(sessionId: string): number {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS c FROM chat_messages
       WHERE session_id = ?
         AND role = 'user'
         AND created_at >= datetime('now', '-1 minute')`
    )
    .get(sessionId) as { c: number }
  return row.c
}

export function hasSessionAutoAck(sessionId: string): boolean {
  const row = getDb()
    .prepare(
      `SELECT 1 FROM chat_messages
       WHERE session_id = ? AND role = 'bot' AND automated = 1
       LIMIT 1`
    )
    .get(sessionId)
  return Boolean(row)
}

export function addChatMessage(input: {
  sessionId: string
  role: ChatMessageRole
  body: string
  automated?: boolean
}): ChatMessage {
  const db = getDb()
  const id = crypto.randomUUID()
  db.prepare(
    `INSERT INTO chat_messages (id, session_id, role, body, automated)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, input.sessionId, input.role, input.body, input.automated ? 1 : 0)

  db.prepare(
    `UPDATE chat_sessions
     SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
     WHERE id = ?`
  ).run(input.sessionId)

  return mapMessage(
    db.prepare('SELECT * FROM chat_messages WHERE id = ?').get(id) as {
      id: string
      session_id: string
      role: string
      body: string
      automated: number
      created_at: string
    }
  )
}

export function listChatMessages(sessionId: string): ChatMessage[] {
  const rows = getDb()
    .prepare(
      `SELECT * FROM chat_messages
       WHERE session_id = ?
       ORDER BY created_at ASC`
    )
    .all(sessionId) as {
    id: string
    session_id: string
    role: string
    body: string
    automated: number
    created_at: string
  }[]
  return rows.map(mapMessage)
}

export function deleteChatSession(sessionId: string) {
  getDb().prepare('DELETE FROM chat_sessions WHERE id = ?').run(sessionId)
}
