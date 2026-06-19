'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export const PORTFOLIO_SHEET_CLOSE_MS = 380

type MobileViewportLayout = {
  top: number
  height: number
}

function useMobileViewport(active: boolean) {
  const [layout, setLayout] = useState<MobileViewportLayout | null>(null)

  useEffect(() => {
    if (!active) {
      setLayout(null)
      return
    }

    const mq = window.matchMedia('(max-width: 639px)')

    const update = () => {
      if (!mq.matches) {
        setLayout(null)
        return
      }

      const vv = window.visualViewport
      setLayout({
        top: vv?.offsetTop ?? 0,
        height: vv?.height ?? window.innerHeight,
      })
    }

    update()
    const vv = window.visualViewport
    vv?.addEventListener('resize', update)
    vv?.addEventListener('scroll', update)
    mq.addEventListener('change', update)
    window.addEventListener('orientationchange', update)

    return () => {
      vv?.removeEventListener('resize', update)
      vv?.removeEventListener('scroll', update)
      mq.removeEventListener('change', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [active])

  return layout
}

interface PortfolioSideSheetProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: React.ReactNode
  ariaLabel: string
  closeLabel: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function PortfolioSideSheet({
  open,
  onClose,
  title,
  subtitle,
  ariaLabel,
  closeLabel,
  children,
  footer,
}: PortfolioSideSheetProps) {
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
    }, PORTFOLIO_SHEET_CLOSE_MS)
  }, [isClosing, onClose])

  useEffect(() => {
    setMounted(true)
    setPortalRoot(document.querySelector('.portfolio-theme') as HTMLElement | null)
  }, [])

  useEffect(() => {
    if (!open && !isClosing) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open, isClosing])

  if ((!open && !isClosing) || !mounted || !portalRoot) return null

  return createPortal(
    <div
      className={`fixed z-[200] ${mobileViewport ? '' : 'inset-0'}`}
      style={
        mobileViewport
          ? {
              top: mobileViewport.top,
              left: 0,
              width: '100%',
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
        className={`absolute inset-0 bg-[var(--pf-chat-overlay)] ${isClosing ? 'pf-chat-overlay-out' : 'pf-chat-overlay'} max-sm:hidden`}
        aria-label={closeLabel}
        onClick={requestClose}
      />

      <aside
        className={`absolute z-10 flex h-full min-h-0 w-full max-w-none flex-col bg-[var(--pf-chat-bg)] inset-0 rounded-none shadow-none sm:inset-auto sm:top-8 sm:right-8 sm:bottom-8 sm:h-auto sm:max-w-[min(calc(100vw-2rem),26rem)] sm:rounded-[2rem] sm:shadow-[-24px_0_80px_rgba(0,0,0,0.28)] ${isClosing ? 'pf-chat-sheet-out' : 'pf-chat-sheet'}`}
      >
        <header className="flex shrink-0 items-center justify-between px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-5">
          <div className="min-w-0 pr-3">
            <p className="text-sm font-medium text-[var(--pf-chat-text)]">{title}</p>
            {subtitle ? (
              <div className="mt-0.5">{subtitle}</div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={requestClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--pf-chat-muted)] transition hover:bg-[var(--pf-chat-surface)] hover:text-[var(--pf-chat-text)]"
            aria-label={closeLabel}
          >
            ✕
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-5">
          {children}
        </div>

        {footer ? (
          <footer className="shrink-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:pb-5">
            {footer}
          </footer>
        ) : null}
      </aside>
    </div>,
    portalRoot
  )
}
