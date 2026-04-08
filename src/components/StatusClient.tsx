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
    // DEV MOCK
    if (process.env.NODE_ENV === 'development') {
      setServers([
        { name: '🇩🇪 Германия', protocol: 'vless', alive: true, latency: 412 },
        { name: '🇫🇮 Финляндия', protocol: 'vless', alive: true, latency: 298 },
        { name: '🇳🇱 Нидерланды', protocol: 'vless', alive: false, latency: 0 },
        { name: '🇵🇱 Польша', protocol: 'vless', alive: true, latency: 387 },
        { name: '🇷🇺 Россия #1', protocol: 'vless', alive: true, latency: 440 },
      ])
      return
    }
    const fetchData = async () => {
      try {
        const res = await fetch('/api/status')
        const json = await res.json()
        if (json.servers?.length) setServers(json.servers)
        setNow(new Date().toLocaleString('ru-RU', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow',
        }))
      } catch { }
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
    : allOnline ? 'Всё работает'
      : 'Что-то не работает'

  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto', padding: '100px 24px 80px' }}>
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontFamily: "'GT Eesti Pro Text', system-ui, sans-serif", fontSize: '12px', fontWeight: 500, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#931b79', marginBottom: '12px' }}>
          статус серверов
        </p>
        <h1 style={{ fontFamily: "'GT Eesti Pro Display', system-ui, sans-serif", fontSize: 'clamp(1.8rem, 5vw, 3rem)', lineHeight: 1.1, color: '#ffffff', marginBottom: '16px' }}>
          {statusHeadline}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {!loading && (
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 14px', background: 'rgba(207,0,163,0.12)', border: '1px solid rgba(207,0,163,0.35)', borderRadius: '999px', fontFamily: "'GT Eesti Pro Text', system-ui, sans-serif", fontSize: '13px', fontWeight: 500, color: '#cf00a3' }}>
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

      <div style={{ marginTop: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', rowGap: '8px' }}>
        <a
          href="https://t.me/postq_vpn_bot"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontFamily: "'GT Eesti Pro Display', system-ui, sans-serif", fontSize: '11px', fontWeight: 400, letterSpacing: '0.08em', color: 'rgba(147,27,121,0.3)', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(147,27,121,0.55)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(147,27,121,0.3)')}
        >
          @postq_vpn_bot
        </a>
        <span style={{ color: 'rgba(147,27,121,0.2)', fontSize: '11px', userSelect: 'none' }}>·</span>
        <a
          href="https://postq.space/privacy"
          style={{ fontFamily: "'GT Eesti Pro Display', system-ui, sans-serif", fontSize: '11px', fontWeight: 400, letterSpacing: '0.08em', color: 'rgba(147,27,121,0.3)', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(147,27,121,0.55)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(147,27,121,0.3)')}
        >
          политика конфиденциальности
        </a>
        <span style={{ color: 'rgba(147,27,121,0.2)', fontSize: '11px', userSelect: 'none' }}>·</span>
        <span style={{ fontFamily: "'GT Eesti Pro Display', system-ui, sans-serif", fontSize: '11px', fontWeight: 400, letterSpacing: '0.08em', color: 'rgba(147,27,121,0.3)', whiteSpace: 'nowrap' }}>
          © 2026 postq vpn
        </span>
      </div>
    </div>
  )
}
