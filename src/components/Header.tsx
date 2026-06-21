'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import PersonalAccountButton from './PersonalAccountButton'

export default function Header() {
  return (
    <header
      className="fixed left-0 right-0 z-50"
      style={{ top: 0, padding: '8px 8px 0', transform: 'translateZ(0)', willChange: 'transform' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Liquid glass pill */}
        <div
          style={{
            position: 'relative',
            borderRadius: 14,
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(207,0,163,0.07)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
            overflow: 'hidden',
          }}
        >
          <div className="px-3 flex items-center justify-between h-14">

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
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--text)' }}>
                  postq vpn
                </span>
              </Link>
            </motion.div>

            {/* Right: account button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <PersonalAccountButton />
            </motion.div>

          </div>
        </div>

      </div>
    </header>
  )
}
