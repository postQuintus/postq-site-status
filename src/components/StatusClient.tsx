'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ServerCard from './ServerCard'
import type { ServerStatus } from '../../app/api/status/route'

interface Props {
  initialServers: ServerStatus[]
  initialServices: ServerStatus[]
}

export default function StatusClient({ initialServers, initialServices = [] }: Props) {
  const [servers, setServers] = useState<ServerStatus[]>(initialServers)
  const [services, setServices] = useState<ServerStatus[]>(initialServices)
  const [now, setNow] = useState(() => new Date().toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow',
  }))

  useEffect(() => {
    // DEV MOCK: VPN servers replaced with fixtures (xray-checker not running locally).
    // Services use real initial data from the server component — no override needed.
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
        if (json.services?.length) setServices(json.services)
        setNow(new Date().toLocaleString('ru-RU', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow',
        }))
      } catch { }
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const online = servers.filter((s) => s.alive).length
  const total = servers.length
  const allOnline = total > 0 && online === total
  const allOffline = total > 0 && online === 0
  const loading = total === 0

  const isPremium = (name: string) => name.includes('🇷🇺')
  const premiumServers = servers.filter((s) => isPremium(s.name))
  const basicServers = servers.filter((s) => !isPremium(s.name))

  const statusHeadline = loading
    ? 'загружаем данные...'
    : allOnline ? 'Всё работает'
    : allOffline ? 'Ничего не работает :('
    : 'Что-то не работает'

  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto', padding: '100px 24px 80px' }}>
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, delay: 0.2 }}
        style={{ marginBottom: '40px' }}
      >
        <h1 style={{ fontFamily: "'GT Eesti Pro Display', system-ui, sans-serif", fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 700, lineHeight: 1.1, color: '#ffffff', marginBottom: '16px' }}>
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
      </motion.div>

      {servers.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {services.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {services.map((svc, i) => <ServerCard key={i} {...svc} showStatus />)}
            </div>
          )}
          {basicServers.length > 0 && (
            <div>
              <p style={{ fontFamily: "'GT Eesti Pro Text', system-ui, sans-serif", fontSize: '11px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(215,194,240,0.3)', marginBottom: '8px' }}>
                postq vpn basic
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {basicServers.map((server, i) => <ServerCard key={i} {...server} />)}
              </div>
            </div>
          )}
          {premiumServers.length > 0 && (
            <div>
              <p style={{ fontFamily: "'GT Eesti Pro Text', system-ui, sans-serif", fontSize: '11px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(215,194,240,0.3)', marginBottom: '8px' }}>
                postq vpn premium
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {premiumServers.map((server, i) => <ServerCard key={i} {...server} />)}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text2)', fontFamily: "'GT Eesti Pro Text', system-ui, sans-serif", fontSize: '14px', background: 'rgba(8,0,26,0.55)', backdropFilter: 'blur(16px) saturate(150%)', WebkitBackdropFilter: 'blur(16px) saturate(150%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
          Данные загружаются. Пожалуйста, подождите...
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        style={{
          borderTop: '1px solid rgba(207,0,163,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          rowGap: '8px',
          padding: '28px 0 0',
          marginTop: '60px',
        }}
      >
        <a
          href="https://t.me/postq_vpn_bot"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontFamily: "'GT Eesti Pro Display', system-ui, sans-serif", fontSize: '11px', letterSpacing: '0.07em', color: 'rgba(215,194,240,0.4)', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(215,194,240,0.7)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(215,194,240,0.4)')}
        >
          @postq_vpn_bot
        </a>
        <span style={{ color: 'rgba(215,194,240,0.2)', fontSize: '11px', userSelect: 'none' }}>·</span>
        <a
          href="https://postq.space/privacy"
          style={{ fontFamily: "'GT Eesti Pro Display', system-ui, sans-serif", fontSize: '11px', letterSpacing: '0.07em', color: 'rgba(215,194,240,0.4)', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'color 0.2s' }}
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
    </div>
  )
}
