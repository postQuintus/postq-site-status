"use client"

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Globe, Bot, type LucideIcon } from 'lucide-react'
import UptimeBar from './UptimeBar'
import type { DayStatus } from '../lib/history-db'

interface ServerCardProps {
  name: string
  protocol: string
  alive: boolean
  latency: number
  subdomain?: string
  history?: DayStatus[]
}

const EMOJI_ICONS: Partial<Record<number, LucideIcon>> = {
  0x1F310: Globe, // 🌐
  0x1F916: Bot,   // 🤖
}

export type NamePrefix =
  | { type: 'flag'; code: string; cleanName: string }
  | { type: 'icon'; Icon: LucideIcon; cleanName: string }
  | { type: 'none'; cleanName: string }

export function parseNamePrefix(name: string): NamePrefix {
  const chars = [...name]
  if (chars.length === 0) return { type: 'none', cleanName: name }

  const cp0 = chars[0].codePointAt(0) ?? 0

  // Pair of regional indicator symbols → country flag
  if (chars.length >= 2) {
    const cp1 = chars[1].codePointAt(0) ?? 0
    if (cp0 >= 0x1F1E6 && cp0 <= 0x1F1FF && cp1 >= 0x1F1E6 && cp1 <= 0x1F1FF) {
      const code = (
        String.fromCharCode(cp0 - 0x1F1E6 + 65) +
        String.fromCharCode(cp1 - 0x1F1E6 + 65)
      ).toLowerCase()
      return { type: 'flag', code, cleanName: name.slice(chars[0].length + chars[1].length).trimStart() }
    }
  }

  // Known single emoji → lucide icon
  const Icon = EMOJI_ICONS[cp0]
  if (Icon) {
    return { type: 'icon', Icon, cleanName: name.slice(chars[0].length).trimStart() }
  }

  return { type: 'none', cleanName: name }
}

export default function ServerCard({ name, alive, subdomain, history }: ServerCardProps) {
  const [open, setOpen] = useState(false)
  const hasHistory = Boolean(history && history.length > 0)
  const isOpen = open && hasHistory
  const dotColor = alive ? '#22c55e' : '#ef4444'

  const prefix = parseNamePrefix(name)

  return (
    <div>
      <button
        type="button"
        onClick={() => hasHistory && setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '24px 18px',
          background: 'none',
          border: 'none',
          cursor: hasHistory ? 'pointer' : 'default',
          textAlign: 'left',
          font: 'inherit',
          color: 'inherit',
        }}
      >
        {/* Disclosure chevron */}
        <span style={{ flexShrink: 0, width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hasHistory ? 1 : 0 }}>
          <ChevronDown
            size={16}
            color="var(--text2)"
            style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s ease' }}
          />
        </span>

        {/* Server name */}
        <span
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: "'GT Eesti Pro Text', system-ui, -apple-system, sans-serif",
            fontSize: '14px',
            fontWeight: 400,
            color: 'var(--text)',
            overflow: 'hidden',
          }}
        >
          {prefix.type === 'flag' && (
            <img
              src={`https://flagcdn.com/20x15/${prefix.code}.png`}
              srcSet={`https://flagcdn.com/40x30/${prefix.code}.png 2x`}
              width={20}
              height={15}
              alt={prefix.code.toUpperCase()}
              style={{ flexShrink: 0, borderRadius: '2px', display: 'block' }}
            />
          )}
          {/* Solid, not alpha — var(--text2) is an rgba() and the globe/bot
              glyphs have self-overlapping strokes; alpha there double-blends
              into a dark smear at every crossing (same fix as postq-site's
              .help-search-icon). */}
          {prefix.type === 'icon' && (
            <prefix.Icon size={16} color="#8b7ea3" style={{ flexShrink: 0 }} />
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {prefix.type === 'none' ? name : prefix.cleanName}
          </span>
        </span>

        {/* Status */}
        <span
          style={{
            flexShrink: 0,
            fontFamily: "'GT Eesti Pro Text', system-ui, -apple-system, sans-serif",
            fontSize: '13px',
            fontWeight: 400,
            color: dotColor,
          }}
        >
          {alive ? 'Работает' : 'Не работает'}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '20px 18px 20px' }}>
              <UptimeBar history={history!} subdomain={subdomain} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
