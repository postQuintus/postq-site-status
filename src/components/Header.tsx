'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import PersonalAccountButton from './PersonalAccountButton'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) setMobileOpen(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrolled])

  return (
    <header
      className="fixed left-0 right-0 z-50 transition-all duration-500"
      style={{
        top: 0,
        background: scrolled || mobileOpen ? 'rgba(4,0,15,0.7)' : 'transparent',
        backdropFilter: scrolled || mobileOpen ? 'blur(24px) saturate(160%)' : 'none',
        WebkitBackdropFilter: scrolled || mobileOpen ? 'blur(24px) saturate(160%)' : 'none',
        borderBottom: scrolled || mobileOpen
          ? '1px solid rgba(207,0,163,0.12)'
          : '1px solid transparent',
        boxShadow: scrolled || mobileOpen
          ? '0 1px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)'
          : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link href="https://postq.space" className="flex items-center gap-2.5 no-underline">
            <div className="relative h-8 w-8 flex-shrink-0">
              <Image src="/icons/icon.svg" alt="postq logo" fill className="object-contain" />
            </div>
            <span style={{ fontFamily: "'GT Eesti Pro Display', system-ui, sans-serif", fontSize: '16px', color: 'var(--text)' }}>
              postq vpn
            </span>
          </Link>
        </motion.div>

        {/* Right: account button + burger */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <div className="hidden md:block">
            <PersonalAccountButton />
          </div>

          {/* Burger */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Меню"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '5px', width: 24, height: 24 }}>
              <motion.span
                animate={mobileOpen
                  ? { rotate: 45, y: 6.5, backgroundColor: 'rgba(207,0,163,0.9)' }
                  : { rotate: 0,  y: 0,   backgroundColor: 'rgba(215,194,240,0.7)' }}
                transition={{ duration: 0.22 }}
                style={{ display: 'block', height: 1.5, borderRadius: 2, transformOrigin: 'center' }}
              />
              <motion.span
                animate={mobileOpen
                  ? { scaleX: 0, opacity: 0 }
                  : { scaleX: 1, opacity: 1, backgroundColor: 'rgba(215,194,240,0.7)' }}
                transition={{ duration: 0.15 }}
                style={{ display: 'block', height: 1.5, borderRadius: 2, transformOrigin: 'center' }}
              />
              <motion.span
                animate={mobileOpen
                  ? { rotate: -45, y: -6.5, backgroundColor: 'rgba(207,0,163,0.9)' }
                  : { rotate: 0,   y: 0,    backgroundColor: 'rgba(215,194,240,0.7)' }}
                transition={{ duration: 0.22 }}
                style={{ display: 'block', height: 1.5, borderRadius: 2, transformOrigin: 'center' }}
              />
            </div>
          </button>
        </motion.div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '8px 24px 20px', display: 'flex', flexDirection: 'column', gap: '2px', borderTop: '1px solid rgba(207,0,163,0.08)' }}>
              <div style={{ marginTop: '12px' }}>
                <PersonalAccountButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
