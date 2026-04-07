'use client'

import { useEffect, useState } from 'react'
import ServerCard from './ServerCard'
import type { ServerStatus } from '../../app/api/status/route'

interface Props {
  initialServers: ServerStatus[]
}

export default function StatusClient({ initialServers }: Props) {
  const [servers, setServers] = useState<ServerStatus[]>(initialServers)
  const [now, setNow] = useState(() => new Date().toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow',
  }))

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/status')
        const json = await res.json()
        if (json.servers?.length) setServers(json.servers)
        setNow(new Date().toLocaleString('ru-RU', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow',
        }))
      } catch {}
    }
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const online = servers.filter((s) => s.alive).length
  const total = servers.length
  const allOnline = total > 0 && online === total
  const allOffline = total > 0 && online === 0
  const loading = total === 0

  const statusHeadline = loading
    ? 'загружаем данные...'
    : allOnline ? 'все серверы работают'
    : allOffline ? 'серверы недоступны'
    : `${online} из ${total} серверов онлайн`

  const badgeColor = loading ? 'rgba(161,161,170,0.15)' : allOnline ? 'rgba(34,197,94,0.12)' : allOffline ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)'
  const badgeBorder = loading ? 'rgba(161,161,170,0.3)' : allOnline ? 'rgba(34,197,94,0.35)' : allOffline ? 'rgba(239,68,68,0.35)' : 'rgba(245,158,11,0.35)'
  const badgeText = loading ? '#a1a1aa' : allOnline ? '#22c55e' : allOffline ? '#ef4444' : '#f59e0b'

  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto', padding: '100px 24px 80px' }}>
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontFamily: "'GT Eesti Pro Text', system-ui, sans-serif", fontSize: '12px', fontWeight: 500, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#931b79', marginBottom: '12px' }}>
          статус серверов
        </p>
        <h1 style={{ fontFamily: "'GT Eesti Pro Display', system-ui, sans-serif", fontSize: 'clamp(1.8rem, 5vw, 3rem)', lineHeight: 1.1, color: '#cf00a3', textShadow: '0 0 40px rgba(207,0,163,0.2)', marginBottom: '16px' }}>
          {statusHeadline}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {!loading && (
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 14px', background: badgeColor, border: `1px solid ${badgeBorder}`, borderRadius: '999px', fontFamily: "'GT Eesti Pro Text', system-ui, sans-serif", fontSize: '13px', fontWeight: 500, color: badgeText }}>
              {online} / {total} онлайн
            </span>
          )}
          <span style={{ fontFamily: "'GT Eesti Pro Text', system-ui, sans-serif", fontSize: '12px', color: 'var(--text2)' }}>
            обновлено {now} МСК
          </span>
        </div>
      </div>

      {servers.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {servers.map((server, i) => <ServerCard key={i} {...server} />)}
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text2)', fontFamily: "'GT Eesti Pro Text', system-ui, sans-serif", fontSize: '14px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px' }}>
          Данные загружаются. Пожалуйста, подождите...
        </div>
      )}

      <div style={{ marginTop: '60px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <a href="https://t.me/postq_vpn_bot" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'GT Eesti Pro Display', system-ui, sans-serif", fontSize: '12px', color: 'rgba(147,27,121,0.7)', textDecoration: 'none', letterSpacing: '0.06em' }}>@postq_vpn_bot</a>
        <span style={{ color: 'var(--border)', fontSize: '12px' }}>·</span>
        <a href="https://postq.space/privacy" style={{ fontFamily: "'GT Eesti Pro Display', system-ui, sans-serif", fontSize: '12px', color: 'rgba(147,27,121,0.7)', textDecoration: 'none', letterSpacing: '0.06em' }}>политика конфиденциальности</a>
        <span style={{ color: 'var(--border)', fontSize: '12px' }}>·</span>
        <span style={{ fontFamily: "'GT Eesti Pro Display', system-ui, sans-serif", fontSize: '12px', color: 'rgba(147,27,121,0.5)', letterSpacing: '0.04em' }}>© 2026 PostQ VPN</span>
      </div>
    </div>
  )
}
