'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { portfolioLabels } from '@/lib/portfolio/copy'
import { CHAT_MESSAGE_MAX_LENGTH, CHAT_OWNER_PRESENCE_MS } from '@/lib/domains/chat/constants'
import type { ChatMessageRole, ChatSessionStatus } from '@/lib/domains/chat/types'
import { PortfolioSideSheet } from './PortfolioSideSheet'

const SCRIPT = [
  'Oi, aqui é o Edu. Nem sempre estou on-line, mas leio todas as mensagens.',
  'Deixe seu contato e uma mensagem, se quiser. Assim que possível, retorno para continuarmos a conversa.',
] as const

const SCRIPT_PAUSE_MS = 320
const SCRIPT_TYPING_MS = 520
const REPLY_TYPING_MS = 480
const HIGHLIGHT_MS = 2200

type ChatMessage = {
  id: string
  role: ChatMessageRole
  body: string
  automated?: boolean
}

function ChatBubble({ message, highlight }: { message: ChatMessage; highlight?: boolean }) {
  const isUser = message.role === 'user'
  const isOwner = message.role === 'owner'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-[1.25rem] px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-[var(--pf-chat-user)] text-[var(--pf-chat-text)] rounded-br-md'
            : isOwner
              ? 'bg-[var(--pf-chat-surface)] text-[var(--pf-chat-text)] rounded-bl-md ring-1 ring-emerald-500/20'
              : 'bg-[var(--pf-chat-surface)] text-[var(--pf-chat-text)] rounded-bl-md'
        } ${highlight ? 'pf-chat-bubble-highlight' : ''}`}
      >
        {message.body}
        {message.automated && (
          <p className="mt-0.5 text-[11px] text-[var(--pf-chat-muted)]">
            {portfolioLabels.chatAutomated}
          </p>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start" aria-live="polite" aria-label={portfolioLabels.chatTyping}>
      <div className="rounded-[1.25rem] rounded-bl-md bg-[var(--pf-chat-surface)] px-4 py-3">
        <span className="flex items-center gap-1.5">
          <span className="pf-chat-typing-dot" />
          <span className="pf-chat-typing-dot" />
          <span className="pf-chat-typing-dot" />
        </span>
      </div>
    </div>
  )
}

function ChatStatusLabel({ status }: { status: ChatSessionStatus }) {
  const isOnline = status === 'online'
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--pf-chat-muted)]">
      <span
        className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-[var(--pf-chat-muted)] opacity-50'}`}
        aria-hidden
      />
      {isOnline ? portfolioLabels.chatStatusOnline : portfolioLabels.chatStatusOffline}
    </span>
  )
}

function flushRemainingIntro(
  messages: ChatMessage[],
  scriptIndex: number
): { messages: ChatMessage[]; scriptDone: true } {
  const existing = new Set(messages.map((m) => m.id))
  const rest = SCRIPT.slice(scriptIndex)
    .map((body, i) => ({
      id: `bot-${scriptIndex + i}`,
      role: 'bot' as const,
      body,
      automated: true,
    }))
    .filter((m) => !existing.has(m.id))

  return {
    messages: rest.length ? [...messages, ...rest] : messages,
    scriptDone: true,
  }
}

interface PanelProps {
  open: boolean
  onClose: () => void
  sessionId: string | null
  sessionReady: boolean
  sessionStatus: ChatSessionStatus
  messages: ChatMessage[]
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  scriptDone: boolean
  setScriptDone: React.Dispatch<React.SetStateAction<boolean>>
  scriptIndex: number
  setScriptIndex: React.Dispatch<React.SetStateAction<number>>
  botTyping: boolean
  setBotTyping: React.Dispatch<React.SetStateAction<boolean>>
  sessionLimitReached: boolean
  setSessionLimitReached: React.Dispatch<React.SetStateAction<boolean>>
  highlightedIds: Set<string>
  setSessionStatus: React.Dispatch<React.SetStateAction<ChatSessionStatus>>
}

function PortfolioChatPanel({
  open,
  onClose,
  sessionId,
  sessionReady,
  sessionStatus,
  messages,
  setMessages,
  scriptDone,
  setScriptDone,
  scriptIndex,
  setScriptIndex,
  botTyping,
  setBotTyping,
  sessionLimitReached,
  setSessionLimitReached,
  highlightedIds,
  setSessionStatus,
}: PanelProps) {
  const [input, setInput] = useState('')
  const [sendError, setSendError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' })
  }, [])

  const appendMessage = useCallback(
    (message: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev
        return [...prev, message]
      })
    },
    [setMessages]
  )

  useEffect(() => {
    if (!open || scriptDone || !sessionReady) return
    if (scriptIndex >= SCRIPT.length) {
      setBotTyping(false)
      setScriptDone(true)
      return
    }

    const body = SCRIPT[scriptIndex]
    let typingTimer: number | undefined

    const pauseTimer = window.setTimeout(() => {
      setBotTyping(true)
      typingTimer = window.setTimeout(() => {
        setBotTyping(false)
        appendMessage({
          id: `bot-${scriptIndex}`,
          role: 'bot',
          body,
          automated: true,
        })
        setScriptIndex((i) => i + 1)
      }, SCRIPT_TYPING_MS)
    }, SCRIPT_PAUSE_MS)

    return () => {
      window.clearTimeout(pauseTimer)
      if (typingTimer !== undefined) window.clearTimeout(typingTimer)
    }
  }, [
    open,
    scriptDone,
    scriptIndex,
    sessionReady,
    appendMessage,
    setBotTyping,
    setScriptDone,
    setScriptIndex,
  ])

  useEffect(() => {
    scrollToBottom()
  }, [messages, botTyping, open, scrollToBottom])

  useEffect(() => {
    if (scriptDone && open) {
      inputRef.current?.focus({ preventScroll: true })
    }
  }, [scriptDone, open])

  const handleInputFocus = () => {
    scrollToBottom('auto')
    window.setTimeout(() => scrollToBottom('smooth'), 280)
  }

  const showAutoReply = useCallback(
    (body: string, id: string) => {
      window.setTimeout(() => setBotTyping(true), SCRIPT_PAUSE_MS)
      window.setTimeout(() => {
        setBotTyping(false)
        appendMessage({ id, role: 'bot', body, automated: true })
      }, SCRIPT_PAUSE_MS + REPLY_TYPING_MS)
    },
    [appendMessage, setBotTyping]
  )

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || !scriptDone || !sessionId || sessionLimitReached) return
    if (text.length > CHAT_MESSAGE_MAX_LENGTH) {
      setSendError(portfolioLabels.chatMessageTooLong)
      return
    }

    setSendError(null)
    const optimisticId = `user-${Date.now()}`
    appendMessage({ id: optimisticId, role: 'user', body: text })
    setInput('')

    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: text }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
        if (data.code === 'SESSION_MESSAGE_LIMIT') {
          setSessionLimitReached(true)
        }
        setSendError(data.error ?? portfolioLabels.chatRateLimit)
        return
      }

      if (data.userMessage?.id) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? { ...m, id: data.userMessage.id } : m))
        )
      }

      setSessionStatus(data.session.status)

      if (data.autoReply) {
        showAutoReply(data.autoReply.body, data.autoReply.id)
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
      setSendError('Não foi possível enviar. Tente novamente.')
    }
  }

  const inputDisabled = !scriptDone || !sessionReady || !sessionId || sessionLimitReached
  const charCount = input.length
  const charNearLimit = charCount > CHAT_MESSAGE_MAX_LENGTH * 0.9

  return (
    <PortfolioSideSheet
      open={open}
      onClose={onClose}
      title={portfolioLabels.chatTitle}
      subtitle={<ChatStatusLabel status={sessionStatus} />}
      ariaLabel={portfolioLabels.chatTitle}
      closeLabel={portfolioLabels.chatClose}
      footer={
        <div className="space-y-2">
          {sendError ? (
            <p className="px-2 text-center text-xs text-red-400/90" role="alert">
              {sendError}
            </p>
          ) : null}
          <div className="flex items-end gap-2 rounded-[1.5rem] bg-[var(--pf-chat-input)] p-2">
            <div className="min-w-0 flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value.slice(0, CHAT_MESSAGE_MAX_LENGTH))
                  if (sendError) setSendError(null)
                }}
                onFocus={handleInputFocus}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void sendMessage()
                  }
                }}
                rows={1}
                disabled={inputDisabled}
                maxLength={CHAT_MESSAGE_MAX_LENGTH}
                placeholder={
                  sessionLimitReached
                    ? portfolioLabels.chatSessionLimit
                    : scriptDone && sessionReady
                      ? portfolioLabels.chatPlaceholder
                      : portfolioLabels.chatWaiting
                }
                className="min-h-[2.75rem] max-h-32 w-full resize-none bg-transparent px-3 py-2 text-sm leading-5 text-[var(--pf-chat-text)] placeholder:text-[var(--pf-chat-muted)] focus:outline-none disabled:opacity-50"
              />
              {scriptDone && sessionReady ? (
                <p
                  className={`px-3 pb-0.5 text-[10px] tabular-nums ${
                    charNearLimit ? 'text-amber-400/90' : 'text-[var(--pf-chat-muted)]'
                  }`}
                  aria-live="polite"
                >
                  {portfolioLabels.chatCharCount(charCount, CHAT_MESSAGE_MAX_LENGTH)}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={inputDisabled || !input.trim()}
              className="mb-1 flex h-11 shrink-0 items-center justify-center rounded-full bg-[var(--pf-chat-send)] px-4 text-sm font-medium leading-none text-[var(--pf-chat-send-text)] transition hover:bg-[var(--pf-chat-send-hover)] disabled:opacity-35 disabled:hover:bg-[var(--pf-chat-send)]"
            >
              {portfolioLabels.chatSend}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} highlight={highlightedIds.has(msg.id)} />
        ))}
        {botTyping && open && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </PortfolioSideSheet>
  )
}

export function PortfolioChatLauncher() {
  const [open, setOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionStatus, setSessionStatus] = useState<ChatSessionStatus>('offline')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [scriptDone, setScriptDone] = useState(false)
  const [scriptIndex, setScriptIndex] = useState(0)
  const [botTyping, setBotTyping] = useState(false)
  const [sessionLimitReached, setSessionLimitReached] = useState(false)
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(() => new Set())

  const openRef = useRef(open)
  const sessionIdRef = useRef(sessionId)
  const presenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const highlightTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    sessionIdRef.current = sessionId
  }, [sessionId])

  const markOwnerOnline = useCallback(() => {
    setSessionStatus('online')
    if (presenceTimerRef.current) clearTimeout(presenceTimerRef.current)
    presenceTimerRef.current = setTimeout(() => {
      setSessionStatus('offline')
      presenceTimerRef.current = null
    }, CHAT_OWNER_PRESENCE_MS)
  }, [])

  const highlightMessage = useCallback((id: string) => {
    setHighlightedIds((prev) => new Set(prev).add(id))
    const existing = highlightTimersRef.current.get(id)
    if (existing) clearTimeout(existing)
    const timer = setTimeout(() => {
      setHighlightedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      highlightTimersRef.current.delete(id)
    }, HIGHLIGHT_MS)
    highlightTimersRef.current.set(id, timer)
  }, [])

  const appendOwnerMessage = useCallback(
    (message: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev
        return [...prev, message]
      })
      highlightMessage(message.id)
      markOwnerOnline()
      if (!openRef.current) {
        setOpen(true)
      }
    },
    [highlightMessage, markOwnerOnline]
  )

  // Cria sessão na primeira abertura; reaberturas reutilizam a existente
  useEffect(() => {
    if (!open || sessionId) return

    let cancelled = false
    setSessionReady(false)

    fetch('/api/chat/sessions', { method: 'POST' })
      .then((res) => res.json())
      .then((data: { sessionId?: string; status?: ChatSessionStatus }) => {
        if (cancelled || !data.sessionId) return
        setSessionId(data.sessionId)
        setSessionStatus(data.status ?? 'offline')
        setSessionReady(true)
      })
      .catch(() => {
        if (!cancelled) setSessionReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [open, sessionId])

  // SSE permanece ativo enquanto a sessão existir (mesmo com chat fechado)
  useEffect(() => {
    if (!sessionId) return

    const source = new EventSource(`/api/chat/sessions/${sessionId}/stream`)

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as
          | { type: 'message'; message: ChatMessage }
          | { type: 'status'; status: ChatSessionStatus }

        if (payload.type === 'message' && payload.message.role === 'owner') {
          appendOwnerMessage({
            id: payload.message.id,
            role: payload.message.role,
            body: payload.message.body,
            automated: payload.message.automated,
          })
        }

        if (payload.type === 'status') {
          if (payload.status === 'online') {
            markOwnerOnline()
          } else {
            if (presenceTimerRef.current) {
              clearTimeout(presenceTimerRef.current)
              presenceTimerRef.current = null
            }
            setSessionStatus('offline')
          }
        }
      } catch {
        /* ignore malformed SSE */
      }
    }

    return () => source.close()
  }, [sessionId, appendOwnerMessage, markOwnerOnline])

  // Encerra sessão no servidor ao sair da página (não ao fechar o painel)
  useEffect(() => {
    if (!sessionId) return

    const cleanup = () => {
      fetch(`/api/chat/sessions/${sessionId}`, { method: 'DELETE', keepalive: true }).catch(
        () => {}
      )
    }

    window.addEventListener('pagehide', cleanup)
    return () => window.removeEventListener('pagehide', cleanup)
  }, [sessionId])

  useEffect(() => {
    return () => {
      if (presenceTimerRef.current) clearTimeout(presenceTimerRef.current)
      for (const timer of highlightTimersRef.current.values()) clearTimeout(timer)
    }
  }, [])

  const handleClose = useCallback(() => {
    if (!scriptDone) {
      setBotTyping(false)
      const flushed = flushRemainingIntro(messages, scriptIndex)
      setMessages(flushed.messages)
      setScriptDone(true)
      setScriptIndex(SCRIPT.length)
    }
    setOpen(false)
  }, [messages, scriptDone, scriptIndex])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--pf-surface-2)] px-6 py-2.5 text-base text-[var(--pf-muted-2)] transition-colors duration-300 hover:bg-[var(--pf-btn-hover-bg)] hover:text-[var(--pf-btn-hover-text)] sm:text-lg"
      >
        <ChatIcon />
        {portfolioLabels.chatOpen}
      </button>

      <PortfolioChatPanel
        open={open}
        onClose={handleClose}
        sessionId={sessionId}
        sessionReady={sessionReady}
        sessionStatus={sessionStatus}
        messages={messages}
        setMessages={setMessages}
        scriptDone={scriptDone}
        setScriptDone={setScriptDone}
        scriptIndex={scriptIndex}
        setScriptIndex={setScriptIndex}
        botTyping={botTyping}
        setBotTyping={setBotTyping}
        sessionLimitReached={sessionLimitReached}
        setSessionLimitReached={setSessionLimitReached}
        highlightedIds={highlightedIds}
        setSessionStatus={setSessionStatus}
      />
    </>
  )
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}
