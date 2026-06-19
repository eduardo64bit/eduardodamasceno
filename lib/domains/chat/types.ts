export type ChatSessionStatus = 'offline' | 'online'

export type ChatMessageRole = 'bot' | 'user' | 'owner'

export interface ChatMessage {
  id: string
  sessionId: string
  role: ChatMessageRole
  body: string
  automated: boolean
  createdAt: string
}

export interface ChatSession {
  id: string
  shortCode: string
  status: ChatSessionStatus
  ownerPresenceUntil: string | null
  createdAt: string
  updatedAt: string
  expiresAt: string
}

export type ChatStreamEvent =
  | { type: 'message'; message: ChatMessage }
  | { type: 'status'; status: ChatSessionStatus }
