'use client'

import { useEffect } from 'react'

/**
 * Blocks rubber-band bounce past the bottom of the page only. Mobile Chrome/
 * Safari's collapsing toolbar briefly grows the scrollable range mid-fling,
 * so the bottom bounce overshoot became large enough to read as scrolling
 * into blank space before snapping back at the real end.
 *
 * `overscroll-behavior-y` can't target one edge — any non-`auto` value also
 * kills pull-to-refresh at the top, so this handles just the bottom edge by
 * hand: track touch drag direction and preventDefault only when already at
 * the true bottom and the drag would push further past it.
 */
export default function BottomOverscrollGuard() {
  useEffect(() => {
    let lastY = 0

    const onTouchStart = (e: TouchEvent) => {
      lastY = e.touches[0].clientY
    }

    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY
      const draggingUp = y < lastY // finger moving up = trying to scroll further down
      lastY = y
      if (!draggingUp) return

      const scroller = document.scrollingElement || document.documentElement
      const maxScroll = scroller.scrollHeight - window.innerHeight
      const atBottom = maxScroll > 0 && scroller.scrollTop >= maxScroll - 1
      if (atBottom) e.preventDefault()
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  return null
}
