import { publishChatEvent } from './events'
import { CHAT_OWNER_PRESENCE_MS } from './constants'
import {
  clearOwnerPresenceUntil,
  getChatSession,
  setChatSessionStatus,
  setOwnerPresenceUntil,
} from './repository'

const timers = new Map<string, ReturnType<typeof setTimeout>>()

function clearPresenceTimer(sessionId: string) {
  const timer = timers.get(sessionId)
  if (timer) {
    clearTimeout(timer)
    timers.delete(sessionId)
  }
}

export function expireOwnerPresence(sessionId: string) {
  clearPresenceTimer(sessionId)

  const session = getChatSession(sessionId)
  if (!session || session.status !== 'online') return

  if (session.ownerPresenceUntil) {
    const until = new Date(session.ownerPresenceUntil).getTime()
    if (until > Date.now()) {
      schedulePresenceExpiry(sessionId, until - Date.now())
      return
    }
  }

  setChatSessionStatus(sessionId, 'offline')
  clearOwnerPresenceUntil(sessionId)
  publishChatEvent(sessionId, { type: 'status', status: 'offline' })
}

function schedulePresenceExpiry(sessionId: string, delayMs: number) {
  clearPresenceTimer(sessionId)
  const timer = setTimeout(() => expireOwnerPresence(sessionId), delayMs)
  timers.set(sessionId, timer)
}

export function refreshOwnerPresence(sessionId: string) {
  const until = new Date(Date.now() + CHAT_OWNER_PRESENCE_MS).toISOString()

  setChatSessionStatus(sessionId, 'online')
  setOwnerPresenceUntil(sessionId, until)
  publishChatEvent(sessionId, { type: 'status', status: 'online' })
  schedulePresenceExpiry(sessionId, CHAT_OWNER_PRESENCE_MS)
}

export function reconcileSessionPresence(sessionId: string) {
  const session = getChatSession(sessionId)
  if (!session) return null

  if (session.status !== 'online' || !session.ownerPresenceUntil) {
    return session
  }

  const remaining = new Date(session.ownerPresenceUntil).getTime() - Date.now()
  if (remaining <= 0) {
    expireOwnerPresence(sessionId)
    return getChatSession(sessionId)
  }

  schedulePresenceExpiry(sessionId, remaining)
  return session
}
