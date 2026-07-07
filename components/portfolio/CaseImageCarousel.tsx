'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CaseSlide } from '@/lib/portfolio/case-content'
import { portfolioLabels } from '@/lib/portfolio/copy'

interface Props {
  slides: CaseSlide[]
  title: string
}

const SWIPE_THRESHOLD_PX = 48

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

export function CaseImageCarousel({ slides, title }: Props) {
  const [index, setIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStart = useRef({ x: 0, y: 0 })
  const dragAxis = useRef<'none' | 'x' | 'y'>('none')
  const draggingRef = useRef(false)
  const total = slides.length

  const go = useCallback(
    (next: number) => {
      if (total <= 1) return
      setIndex((next + total) % total)
    },
    [total]
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (total <= 1) return
      const touch = e.touches[0]
      touchStart.current = { x: touch.clientX, y: touch.clientY }
      dragAxis.current = 'none'
      draggingRef.current = true
      setIsDragging(true)
      setDragOffset(0)
    },
    [total]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!draggingRef.current || total <= 1) return
      const touch = e.touches[0]
      const dx = touch.clientX - touchStart.current.x
      const dy = touch.clientY - touchStart.current.y

      if (dragAxis.current === 'none') {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
        dragAxis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      }

      if (dragAxis.current !== 'x') return

      const atStart = index === 0 && dx > 0
      const atEnd = index === total - 1 && dx < 0
      const resisted = atStart || atEnd ? dx * 0.35 : dx
      setDragOffset(resisted)
    },
    [index, total]
  )

  const handleTouchEnd = useCallback(() => {
    if (!draggingRef.current) return
    draggingRef.current = false
    setIsDragging(false)
    dragAxis.current = 'none'

    if (dragOffset > SWIPE_THRESHOLD_PX) go(index - 1)
    else if (dragOffset < -SWIPE_THRESHOLD_PX) go(index + 1)

    setDragOffset(0)
  }, [dragOffset, go, index])

  const handleTouchCancel = useCallback(() => {
    draggingRef.current = false
    setIsDragging(false)
    dragAxis.current = 'none'
    setDragOffset(0)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(index - 1)
      if (e.key === 'ArrowRight') go(index + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, index])

  if (total === 0) return null

  const current = slides[index]

  return (
    <section
      className="mb-12"
      aria-roledescription="carrossel"
      aria-label={portfolioLabels.gallery}
    >
      <div
        className="relative h-[min(56vh,520px)] overflow-hidden rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface-2)] touch-pan-y select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        <div
          className="flex h-full ease-out"
          style={{
            transform: `translateX(calc(-${index * 100}% + ${dragOffset}px))`,
            transition: isDragging ? 'none' : 'transform 300ms ease-out',
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={`${slide.src}-${i}`}
              className="min-w-full h-full flex items-center justify-center p-2 sm:p-4"
              aria-hidden={i !== index}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.src}
                alt={slide.alt || `${title} — imagem ${i + 1}`}
                className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-[var(--pf-bg)]/80 backdrop-blur border border-[var(--pf-border-strong)] text-[var(--pf-text)] hover:bg-[var(--pf-bg)] transition"
              aria-label={portfolioLabels.carouselPrev}
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-[var(--pf-bg)]/80 backdrop-blur border border-[var(--pf-border-strong)] text-[var(--pf-text)] hover:bg-[var(--pf-bg)] transition"
              aria-label={portfolioLabels.carouselNext}
            >
              <ChevronRight />
            </button>

            <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
              <span className="rounded-full bg-[var(--pf-bg)]/80 px-2.5 py-1 text-xs text-[var(--pf-muted-3)] tabular-nums backdrop-blur">
                {index + 1} / {total}
              </span>
            </div>
          </>
        )}
      </div>

      {current.caption && (
        <p className="mt-3 text-sm text-[var(--pf-muted-3)] text-center">{current.caption}</p>
      )}
    </section>
  )
}
