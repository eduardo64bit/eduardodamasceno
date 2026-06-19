'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { portfolioLabels } from '@/lib/portfolio/copy'
import { PortfolioSideSheet } from './PortfolioSideSheet'

const SCRIPT = [
  'Oi, aqui é o Edu 🤖',
  'Nem sempre estou on-line, mas leio todas as mensagens.',
  'Deixe seu contato e uma mensagem, se quiser. Assim que possível, retorno para continuarmos a conversa.',
] as const

const SCRIPT_PAUSE_MS = 320
const SCRIPT_TYPING_MS = 520
const REPLY_TYPING_MS = 480

const AUTO_REPLY = 'Mensagem recebida, obrigado.'

type ChatMessage = {
  id: string
  role: 'bot' | 'user'
  body: string
  automated?: boolean
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-[1.25rem] px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-[var(--pf-chat-user)] text-[var(--pf-chat-text)] rounded-br-md'
            : 'bg-[var(--pf-chat-surface)] text-[var(--pf-chat-text)] rounded-bl-md'
        }`}
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

interface Props {
  open: boolean
  onClose: () => void
}

function PortfolioChatPanel({ open, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [scriptIndex, setScriptIndex] = useState(0)
  const [scriptDone, setScriptDone] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [input, setInput] = useState('')
  const [closed, setClosed] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' })
  }, [])

  useEffect(() => {
    if (!open) return
    setMessages([])
    setScriptIndex(0)
    setScriptDone(false)
    setIsTyping(false)
    setInput('')
    setClosed(false)
  }, [open])

  useEffect(() => {
    if (!open || scriptDone) return
    if (scriptIndex >= SCRIPT.length) {
      setIsTyping(false)
      setScriptDone(true)
      return
    }

    const body = SCRIPT[scriptIndex]
    let typingTimer: number | undefined

    const pauseTimer = window.setTimeout(() => {
      setIsTyping(true)
      typingTimer = window.setTimeout(() => {
        setIsTyping(false)
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${scriptIndex}`,
            role: 'bot',
            body,
            automated: true,
          },
        ])
        setScriptIndex((i) => i + 1)
      }, SCRIPT_TYPING_MS)
    }, SCRIPT_PAUSE_MS)

    return () => {
      window.clearTimeout(pauseTimer)
      if (typingTimer !== undefined) window.clearTimeout(typingTimer)
    }
  }, [open, scriptDone, scriptIndex])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  useEffect(() => {
    if (scriptDone && open && !closed) {
      inputRef.current?.focus({ preventScroll: true })
    }
  }, [scriptDone, open, closed])

  const handleInputFocus = () => {
    scrollToBottom('auto')
    window.setTimeout(() => scrollToBottom('smooth'), 280)
  }

  const sendMessage = () => {
    const text = input.trim()
    if (!text || !scriptDone || closed || isTyping) return

    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: 'user', body: text }])
    setInput('')

    window.setTimeout(() => {
      setIsTyping(true)
    }, SCRIPT_PAUSE_MS)

    window.setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        { id: `bot-ack-${Date.now()}`, role: 'bot', body: AUTO_REPLY, automated: true },
      ])
      setClosed(true)
    }, SCRIPT_PAUSE_MS + REPLY_TYPING_MS)
  }

  return (
    <PortfolioSideSheet
      open={open}
      onClose={onClose}
      title={portfolioLabels.chatTitle}
      subtitle={portfolioLabels.chatStatus}
      ariaLabel={portfolioLabels.chatTitle}
      closeLabel={portfolioLabels.chatClose}
      footer={
        closed ? (
          <p className="py-3 text-center text-xs text-[var(--pf-chat-muted)]">
            {portfolioLabels.chatEnded}
          </p>
        ) : (
          <div className="flex items-center gap-2 rounded-[1.5rem] bg-[var(--pf-chat-input)] p-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={handleInputFocus}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              rows={1}
              disabled={!scriptDone || isTyping}
              placeholder={
                scriptDone && !isTyping
                  ? portfolioLabels.chatPlaceholder
                  : portfolioLabels.chatWaiting
              }
              className="min-h-[2.75rem] max-h-32 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-5 text-[var(--pf-chat-text)] placeholder:text-[var(--pf-chat-muted)] focus:outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!scriptDone || !input.trim() || isTyping}
              className="flex h-11 shrink-0 items-center justify-center rounded-full bg-[var(--pf-chat-send)] px-4 text-sm font-medium leading-none text-[var(--pf-chat-send-text)] transition hover:bg-[var(--pf-chat-send-hover)] disabled:opacity-35 disabled:hover:bg-[var(--pf-chat-send)]"
            >
              {portfolioLabels.chatSend}
            </button>
          </div>
        )
      }
    >
      <div className="space-y-3">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </PortfolioSideSheet>
  )
}

export function PortfolioChatLauncher() {
  const [open, setOpen] = useState(false)

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

      <PortfolioChatPanel open={open} onClose={() => setOpen(false)} />
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
