'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { lockPageScroll } from '@/lib/portfolio/lockPageScroll'
import { useMobileViewport } from '@/lib/portfolio/useMobileViewport'

export const PORTFOLIO_MODAL_CLOSE_MS = 320

interface PortfolioModalProps {
  open: boolean
  onClose: () => void
  title: string
  ariaLabel: string
  closeLabel: string
  children: React.ReactNode
}

export function PortfolioModal({
  open,
  onClose,
  title,
  ariaLabel,
  closeLabel,
  children,
}: PortfolioModalProps) {
  const [mounted, setMounted] = useState(false)
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const mobileViewport = useMobileViewport(open || isClosing)

  const requestClose = useCallback(() => {
    if (isClosing) return
    setIsClosing(true)
    window.setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, PORTFOLIO_MODAL_CLOSE_MS)
  }, [isClosing, onClose])

  useEffect(() => {
    setMounted(true)
    setPortalRoot(document.querySelector('.portfolio-theme') as HTMLElement | null)
  }, [])

  useEffect(() => {
    if (!open && !isClosing) return
    return lockPageScroll()
  }, [open, isClosing])

  useEffect(() => {
    if (!open || isClosing) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, isClosing, requestClose])

  if ((!open && !isClosing) || !mounted || !portalRoot) return null

  return createPortal(
    <div
      className={`fixed z-[200] flex overflow-hidden p-0 sm:items-center sm:justify-center sm:inset-0 sm:p-8 ${mobileViewport ? 'max-w-full' : 'inset-0'}`}
      style={
        mobileViewport
          ? {
              top: mobileViewport.top,
              left: mobileViewport.left,
              width: mobileViewport.width,
              height: mobileViewport.height,
            }
          : undefined
      }
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-[var(--pf-chat-overlay)] max-sm:hidden ${isClosing ? 'pf-modal-overlay-out' : 'pf-modal-overlay-in'}`}
        aria-label={closeLabel}
        onClick={requestClose}
      />

      <div
        className={`relative z-10 flex h-full min-h-0 w-full min-w-0 max-w-full flex-col overflow-x-hidden bg-[var(--pf-chat-bg)] box-border sm:max-h-[min(calc(100dvh-4rem),40rem)] sm:max-w-lg sm:rounded-[1.75rem] sm:shadow-[0_24px_80px_rgba(0,0,0,0.32)] ${isClosing ? 'pf-modal-panel-out' : 'pf-modal-panel-in'}`}
      >
        <header className="flex shrink-0 items-center justify-between gap-4 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5">
          <h2 className="min-w-0 flex-1 break-words text-base font-medium text-[var(--pf-chat-text)] sm:text-lg">
            {title}
          </h2>
          <button
            type="button"
            onClick={requestClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--pf-chat-muted)] transition hover:bg-[var(--pf-chat-surface)] hover:text-[var(--pf-chat-text)]"
            aria-label={closeLabel}
          >
            ✕
          </button>
        </header>

        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain break-words px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] [overflow-wrap:anywhere] sm:px-6 sm:pb-6">
          {children}
        </div>
      </div>
    </div>,
    portalRoot
  )
}
