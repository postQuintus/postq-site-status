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
 *
 * touchmove alone only covers overscroll while a finger is still on the
 * glass. A fast flick near the bottom keeps scrolling under the browser's
 * own momentum after touchend, with no more touch events to intercept — if
 * the toolbar collapses mid-fling and desyncs the scrollable range right
 * then, that overshoot can stick instead of snapping back. The scroll
 * listener below re-measures live and clamps position whenever it finds
 * scrollTop past the current real bottom, catching that case too.
 */
export default function BottomOverscrollGuard() {
  useEffect(() => {
    let lastY = 0
    let nearBottom = false
    let clampScheduled = false

    // scrollHeight/scrollTop are forced-layout reads, and this file's handlers
    // fire on every touchmove/scroll event — several times per frame during a
    // fling. Measure at most once per frame and keep a coarse `nearBottom`
    // flag so the touchmove hot path can bail without touching layout at all.
    const measure = () => {
      const scroller = document.scrollingElement || document.documentElement
      const maxScroll = scroller.scrollHeight - window.innerHeight
      // 600px margin: even a violent fling moves less than that between two
      // rAF ticks, so the flag can't go stale enough to miss the real bottom.
      nearBottom = maxScroll > 0 && scroller.scrollTop >= maxScroll - 600
      return { scroller, maxScroll }
    }

    const onTouchStart = (e: TouchEvent) => {
      lastY = e.touches[0].clientY
      measure()
    }

    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY
      const draggingUp = y < lastY // finger moving up = trying to scroll further down
      lastY = y
      // Non-passive touchmove already makes the browser wait for this handler
      // before every scroll frame — so the precise (layout-forcing) check only
      // runs in the rare "dragging up while near the bottom edge" case.
      if (!draggingUp || !nearBottom) return

      const { scroller, maxScroll } = measure()
      const atBottom = maxScroll > 0 && scroller.scrollTop >= maxScroll - 1
      if (atBottom) e.preventDefault()
    }

    const onScroll = () => {
      if (clampScheduled) return
      clampScheduled = true
      requestAnimationFrame(() => {
        clampScheduled = false
        const { scroller, maxScroll } = measure()
        if (maxScroll > 0 && scroller.scrollTop > maxScroll) {
          scroller.scrollTop = maxScroll
        }
      })
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return null
}
