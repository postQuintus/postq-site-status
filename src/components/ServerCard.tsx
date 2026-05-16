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
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px) saturate(150%)',
        WebkitBackdropFilter: 'blur(16px) saturate(150%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        transition: 'border-color 200ms ease, box-shadow 200ms ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'rgba(207,0,163,0.25)'
        el.style.boxShadow = '0 0 18px rgba(207,0,163,0.08), inset 0 1px 0 rgba(255,255,255,0.06)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'rgba(255,255,255,0.08)'
        el.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.04)'
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
