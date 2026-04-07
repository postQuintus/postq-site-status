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
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        transition: 'border-color 200ms ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(207, 0, 163, 0.25)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
      }}
    >
      {/* Status dot */}
      <span
        className={alive ? 'dot-pulse' : undefined}
        style={{
          flexShrink: 0,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: dotColor,
          boxShadow: dotGlow,
        }}
      />

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

      {/* Protocol badge */}
      <span
        style={{
          flexShrink: 0,
          padding: '2px 8px',
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          fontFamily: "'GT Eesti Pro Text', system-ui, -apple-system, sans-serif",
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.06em',
          color: 'var(--text2)',
          textTransform: 'uppercase' as const,
        }}
      >
        {latency > 0 ? `${latency} ms` : "—"}
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
        
      </span>
    </div>
  )
}
