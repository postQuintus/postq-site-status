"use client"

import { Globe, Bot, type LucideIcon } from 'lucide-react'

interface ServerCardProps {
  name: string
  protocol: string
  alive: boolean
  latency: number
  showStatus?: boolean
}

const EMOJI_ICONS: Partial<Record<number, LucideIcon>> = {
  0x1F310: Globe, // 🌐
  0x1F916: Bot,   // 🤖
}

type NamePrefix =
  | { type: 'flag'; code: string; cleanName: string }
  | { type: 'icon'; Icon: LucideIcon; cleanName: string }
  | { type: 'none'; cleanName: string }

function parseNamePrefix(name: string): NamePrefix {
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

export default function ServerCard({ name, alive, latency, showStatus }: ServerCardProps) {
  const dotColor = alive ? '#22c55e' : '#ef4444'
  const dotGlow = alive
    ? '0 0 6px rgba(34, 197, 94, 0.7)'
    : '0 0 6px rgba(239, 68, 68, 0.7)'

  const prefix = parseNamePrefix(name)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(207,0,163,0.06)',
        borderRadius: '14px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
        transition: 'border-color 250ms ease, background 250ms ease, box-shadow 250ms ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'rgba(207,0,163,0.14)'
        el.style.background = 'rgba(207,0,163,0.06)'
        el.style.boxShadow = '0 4px 28px rgba(207,0,163,0.08)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'rgba(207,0,163,0.06)'
        el.style.background = 'rgba(255,255,255,0.04)'
        el.style.boxShadow = '0 2px 16px rgba(0,0,0,0.12)'
      }}
    >
      {/* Status dot */}
      <span
        className={alive ? 'dot-wrapper dot-pulse' : 'dot-wrapper'}
        style={{ flexShrink: 0, position: 'relative', width: '8px', height: '8px' }}
      >
        <span style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          background: dotColor,
          boxShadow: dotGlow,
        }} />
      </span>

      {/* Server name */}
      <span
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
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
        {prefix.type === 'icon' && (
          <prefix.Icon size={16} color="var(--text2)" style={{ flexShrink: 0 }} />
        )}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {prefix.type === 'none' ? name : prefix.cleanName}
        </span>
      </span>

      {/* Latency / status */}
      <span
        style={{
          flexShrink: 0,
          minWidth: '72px',
          textAlign: 'right' as const,
          fontFamily: "'GT Eesti Pro Text', system-ui, -apple-system, sans-serif",
          fontSize: '13px',
          fontWeight: 400,
          color: alive ? 'var(--text2)' : '#ef4444',
        }}
      >
        {showStatus
          ? (alive ? 'Работает' : 'Не работает')
          : (latency > 0 ? `${latency} ms` : '—')}
      </span>
    </div>
  )
}
