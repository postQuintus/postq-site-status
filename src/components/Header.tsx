'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import PersonalAccountButton from './PersonalAccountButton'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="fixed left-0 right-0 z-50 transition-all duration-500"
      style={{
        top: 0,
        background: scrolled ? 'rgba(4,0,15,0.7)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px) saturate(160%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(160%)' : 'none',
        borderBottom: scrolled
          ? '1px solid rgba(207,0,163,0.12)'
          : '1px solid transparent',
        boxShadow: scrolled
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

        {/* Personal account button */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PersonalAccountButton />
        </motion.div>

      </div>
    </header>
  )
}
