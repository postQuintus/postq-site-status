"use client"

interface ServerCardProps {
  name: string
  protocol: string
  alive: boolean
  latency: number
}

const PROTOCOL_LABELS: Record<string, string> = {
  vless: 'VLESS',
  vmess: 'VMess',
  trojan: 'Trojan',
  ss: 'SS',
  shadowsocks: 'SS',
  hysteria: 'Hysteria',
  hysteria2: 'Hysteria2',
  tuic: 'TUIC',
}

export default function ServerCard({ name, protocol, alive, latency }: ServerCardProps) {
  const protocolLabel = PROTOCOL_LABELS[protocol.toLowerCase()] ?? protocol.toUpperCase()
  const dotColor = alive ? '#22c55e' : '#ef4444'
  const dotGlow = alive
    ? '0 0 6px rgba(34, 197, 94, 0.7)'
    : '0 0 6px rgba(239, 68, 68, 0.7)'

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
          fontFamily: "'GT Eesti Pro Text', system-ui, -apple-system, sans-serif",
          fontSize: '14px',
          fontWeight: 400,
          color: 'var(--text)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </span>

      {/* Latency */}
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
        {latency > 0 ? `${latency} ms` : '—'}
      </span>
    </div>
  )
}
