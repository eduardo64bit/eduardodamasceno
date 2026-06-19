'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ThemeToggle } from './ThemeToggle'

interface Props {
  name: string
}

const TOP_THRESHOLD = 48
const SCROLL_DELTA = 8

export function PortfolioNav({ name }: Props) {
  const [visible, setVisible] = useState(true)
  const navRef = useRef<HTMLElement>(null)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  useEffect(() => {
    const themeRoot = navRef.current?.closest('.portfolio-theme') as HTMLElement | null
    if (!themeRoot) return

    const syncOffset = (show: boolean) => {
      const h = show && navRef.current ? navRef.current.offsetHeight : 0
      themeRoot.style.setProperty('--pf-nav-offset', `${h}px`)
    }

    syncOffset(visible)

    const nav = navRef.current
    if (!nav) return

    const ro = new ResizeObserver(() => syncOffset(visible))
    ro.observe(nav)

    return () => {
      ro.disconnect()
      themeRoot.style.removeProperty('--pf-nav-offset')
    }
  }, [visible])

  useEffect(() => {
    lastScrollY.current = window.scrollY

    const update = () => {
      const y = window.scrollY
      const prev = lastScrollY.current

      if (y <= TOP_THRESHOLD) {
        setVisible(true)
      } else if (y < prev - SCROLL_DELTA) {
        setVisible(true)
      } else if (y > prev + SCROLL_DELTA) {
        setVisible(false)
      }

      lastScrollY.current = y
      ticking.current = false
    }

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true
        requestAnimationFrame(update)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 inset-x-0 z-50 px-6 sm:px-10 py-4 flex items-center justify-between pointer-events-none transition-transform duration-300 ease-out ${
        visible
          ? 'translate-y-0'
          : '-translate-y-full'
      }`}
      aria-hidden={!visible}
    >
      <div
        className={`pf-glass pointer-events-none absolute inset-0 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden
      />

      <Link
        href="/"
        tabIndex={visible ? 0 : -1}
        className="relative pointer-events-auto text-sm font-medium tracking-wide text-[var(--pf-text)] opacity-90 hover:opacity-100 transition"
      >
        {initials}
      </Link>

      <div className="relative pointer-events-auto">
        <ThemeToggle tabIndex={visible ? 0 : -1} />
      </div>
    </nav>
  )
}
