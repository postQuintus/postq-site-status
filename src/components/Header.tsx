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
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
        background: scrolled ? 'rgba(0,0,0,0.4)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.1)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2.5"
        >
          <Link href="https://postq.space" className="flex items-center gap-2.5 no-underline">
            <div className="relative h-8 w-8 flex-shrink-0">
              <Image
                src="/icons/icon.svg"
                alt="PostQ Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-base font-eesti-display" style={{ color: 'var(--text)' }}>
              postq vpn
            </span>
          </Link>
        </motion.div>

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
