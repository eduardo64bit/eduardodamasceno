import type { ChatStreamEvent } from './types'

type Listener = (event: ChatStreamEvent) => void

const listeners = new Map<string, Set<Listener>>()

export function subscribeChatSession(sessionId: string, listener: Listener): () => void {
  let set = listeners.get(sessionId)
  if (!set) {
    set = new Set()
    listeners.set(sessionId, set)
  }
  set.add(listener)
  return () => {
    set?.delete(listener)
    if (set && set.size === 0) listeners.delete(sessionId)
  }
}

export function publishChatEvent(sessionId: string, event: ChatStreamEvent) {
  const set = listeners.get(sessionId)
  if (!set) return
  for (const listener of set) listener(event)
}
