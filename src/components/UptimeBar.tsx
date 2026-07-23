'use client'

import { useEffect, useRef } from 'react'
import type { DayStatus } from '../lib/history-db'

interface UptimeBarProps {
  history: DayStatus[]
  /** Short host label (e.g. "de3") shown to the left of the strip; "?" for
   *  IP-only addresses, omitted entirely when empty (e.g. non-VPN services). */
  subdomain?: string
}

const STATUS_COLOR: Record<DayStatus['status'], string> = {
  online: '#22c55e',
  partial: '#f59e0b',
  offline: '#ef4444',
  // Not a real status — just an empty slot for days before history started.
  nodata: 'rgba(255,255,255,0.05)',
}

function formatDay(date: string): string {
  const [y, m, d] = date.split('-')
  return `${d}.${m}.${y}`
}

function tooltipFor(day: DayStatus): string {
  const label = formatDay(day.date)
  if (day.status === 'nodata') return `${label} · нет данных`
  if (day.status === 'online') return `${label} · всё работало`
  if (day.status === 'offline') return `${label} · не работало весь день`
  return `${label} · ${day.uptimePct?.toFixed(1)}% аптайм (был сбой)`
}

export default function UptimeBar({ history, subdomain }: UptimeBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [history])

  const known = history.filter((d) => d.status !== 'nodata')
  const avgUptime = known.length > 0
    ? known.reduce((sum, d) => sum + (d.uptimePct ?? 0), 0) / known.length
    : null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '30px' }}>
      {subdomain && (
        <span
          style={{
            flexShrink: 0,
            minWidth: '34px',
            fontFamily: "'GT Eesti Pro Text', system-ui, -apple-system, sans-serif",
            fontSize: '13px',
            fontWeight: 400,
            color: 'var(--text)',
            textTransform: 'uppercase',
          }}
        >
          {subdomain}
        </span>
      )}
      {history.length > 0 && (
        <div
          ref={scrollRef}
          style={{ display: 'flex', gap: '2px', overflowX: 'auto', scrollbarWidth: 'none', minWidth: 0 }}
        >
          {history.map((day) => (
            <span
              key={day.date}
              title={tooltipFor(day)}
              style={{
                flex: '0 0 auto',
                width: '4px',
                height: '20px',
                borderRadius: '2px',
                background: STATUS_COLOR[day.status],
              }}
            />
          ))}
        </div>
      )}
      {avgUptime !== null && (
        <span
          style={{
            flexShrink: 0,
            marginLeft: 'auto',
            fontFamily: "'GT Eesti Pro Text', system-ui, -apple-system, sans-serif",
            fontSize: '12px',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontWeight: 500, color: 'var(--text)' }}>{avgUptime.toFixed(1)}%</span>
        </span>
      )}
    </div>
  )
}
