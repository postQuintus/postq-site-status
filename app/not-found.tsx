'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'

const LOG_LINES = [
  { text: '> инициализация туннеля', suffix: '  [ FAILED ]', delay: 350 },
  { text: '> поиск маршрута', suffix: '  [ NOT FOUND ]', delay: 850 },
  { text: '> диагностика пакетов', suffix: '  [ TIMEOUT ]', delay: 1350 },
  { text: '> код ошибки:', suffix: '  404', delay: 1850 },
]

export default function NotFound() {
  const [visibleLines, setVisibleLines] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    LOG_LINES.forEach((_, i) => {
      setTimeout(() => setVisibleLines(i + 1), LOG_LINES[i].delay)
    })
    const cursor = setInterval(() => setShowCursor(v => !v), 500)
    return () => clearInterval(cursor)
  }, [])

  return (
    <main className="relative w-full h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Header />

      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="spotlight-orb spotlight-orb-1" />
        <div className="spotlight-orb spotlight-orb-2" />
      </div>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-8 px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="text-center max-w-3xl flex flex-col items-center gap-6"
        >
          {/* Terminal log block */}
          <div style={{
            fontFamily: "'GT Eesti Pro Text', monospace, system-ui, sans-serif",
            fontSize: '13px',
            lineHeight: '1.8',
            textAlign: 'left',
            background: 'rgba(8,0,26,0.6)',
            backdropFilter: 'blur(20px) saturate(150%)',
            WebkitBackdropFilter: 'blur(20px) saturate(150%)',
            border: '1px solid rgba(207,0,163,0.18)',
            borderRadius: '10px',
            padding: '14px 20px',
            minWidth: '320px',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 0 32px rgba(207,0,163,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>
            {LOG_LINES.map((line, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  opacity: i < visibleLines ? 1 : 0,
                  transition: 'opacity 0.25s ease',
                }}
              >
                <span style={{ color: 'rgba(215,194,240,0.55)' }}>{line.text}</span>
                <span style={{
                  color: i === LOG_LINES.length - 1 ? '#cf00a3' : 'rgba(207,0,163,0.5)',
                  fontWeight: i === LOG_LINES.length - 1 ? 700 : 400,
                  whiteSpace: 'nowrap',
                }}>
                  {line.suffix}
                </span>
              </div>
            ))}
            <div style={{
              marginTop: '2px',
              color: 'rgba(207,0,163,0.4)',
              opacity: visibleLines >= LOG_LINES.length ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}>
              {'>'} <span style={{ opacity: showCursor ? 1 : 0, transition: 'opacity 0.1s' }}>█</span>
            </div>
          </div>

          <div style={{
            fontFamily: 'monospace',
            fontSize: '12px',
            color: 'rgba(215,194,240,0.45)',
            maxWidth: '38rem',
            textAlign: 'left',
            lineHeight: 1.6,
          }}>
            <span style={{ color: 'rgba(207,0,163,0.5)', marginRight: 8 }}>ERR</span>
            такой страницы не существует — проверьте адрес или перейдите на главную
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-0 left-0 right-0 z-20"
        style={{
          borderTop: '1px solid rgba(207,0,163,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          rowGap: '8px',
          padding: '28px 24px 44px',
        }}
      >
        <a
          href="https://t.me/postq_vpn_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline"
          style={{ fontFamily: "'GT Eesti Pro Display', system-ui, sans-serif", fontSize: '11px', letterSpacing: '0.07em', color: 'rgba(215,194,240,0.4)', whiteSpace: 'nowrap', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(215,194,240,0.7)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(215,194,240,0.4)')}
        >
          @postq_vpn_bot
        </a>
        <span style={{ color: 'rgba(215,194,240,0.2)', fontSize: '11px', userSelect: 'none' }}>·</span>
        <a
          href="https://postq.space/privacy"
          className="no-underline"
          style={{ fontFamily: "'GT Eesti Pro Display', system-ui, sans-serif", fontSize: '11px', letterSpacing: '0.07em', color: 'rgba(215,194,240,0.4)', whiteSpace: 'nowrap', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(215,194,240,0.7)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(215,194,240,0.4)')}
        >
          политика конфиденциальности
        </a>
        <span style={{ color: 'rgba(215,194,240,0.2)', fontSize: '11px', userSelect: 'none' }}>·</span>
        <span style={{ fontFamily: "'GT Eesti Pro Display', system-ui, sans-serif", fontSize: '11px', letterSpacing: '0.07em', color: 'rgba(215,194,240,0.35)', whiteSpace: 'nowrap' }}>
          © 2026 postq vpn
        </span>
      </motion.div>

    </main>
  )
}
