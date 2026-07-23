'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ServerCard from './ServerCard'
import ServerGroup from './ServerGroup'
import IncidentHistory from './IncidentHistory'
import Footer from './Footer'
import type { ServerStatus } from '../../app/api/status/route'
import type { HistoryByName, DayStatus, Incident } from '../lib/history-db'
import { cleanBaseName } from '../lib/format'

interface Props {
  initialServers: ServerStatus[]
  initialServices: ServerStatus[]
}

/** Groups servers that share the same flag + country name into one location.
 *  Each group renders as a single collapsible card (ServerGroup); a country
 *  with only one server renders as a normal ServerCard. */
function groupByLocation(list: ServerStatus[]): [string, ServerStatus[]][] {
  const groups = new Map<string, ServerStatus[]>()
  list.forEach((server, i) => {
    const base = cleanBaseName(server.name)
    const key = base || `${server.name}__${i}`
    groups.set(key, [...(groups.get(key) ?? []), server])
  })
  return Array.from(groups.entries())
}

/** Фиктивная 90-дневная история для дев-мока: почти всегда online, с редкими инцидентами. */
function mockHistory(names: string[]): HistoryByName {
  const days = 90
  const result: HistoryByName = {}
  names.forEach((name, ni) => {
    const history: DayStatus[] = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      const incident = (i + ni * 7) % 23 === 0
      const status: DayStatus['status'] = incident ? 'partial' : 'online'
      history.push({
        date,
        status,
        uptimePct: incident ? 92 : 100,
        totalSamples: 288,
        aliveSamples: incident ? 265 : 288,
      })
    }
    result[name] = history
  })
  return result
}

/** Фиктивные инциденты для дев-мока. */
function mockIncidents(): Incident[] {
  const now = Date.now()
  return [
    { name: '🇳🇱 Нидерланды', subdomain: '?', startAt: now - 2 * 24 * 60 * 60 * 1000, endAt: now - 2 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000, durationMs: 25 * 60 * 1000 },
    { name: '🌐 Личный кабинет', subdomain: '', startAt: now - 2 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000, endAt: now - 2 * 24 * 60 * 60 * 1000 - 50 * 60 * 1000, durationMs: 10 * 60 * 1000 },
    { name: '🇷🇺 Россия #3', subdomain: 'pl1', startAt: now - 9 * 24 * 60 * 60 * 1000, endAt: now - 9 * 24 * 60 * 60 * 1000 + 70 * 60 * 1000, durationMs: 70 * 60 * 1000 },
  ]
}

export default function StatusClient({ initialServers, initialServices = [] }: Props) {
  const [servers, setServers] = useState<ServerStatus[]>(initialServers)
  const [services, setServices] = useState<ServerStatus[]>(initialServices)
  const [history, setHistory] = useState<HistoryByName>({})
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [now, setNow] = useState(() => new Date().toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow',
  }))

  useEffect(() => {
    // DEV MOCK: VPN servers replaced with fixtures (xray-checker not running locally).
    // Services use real initial data from the server component — no override needed.
    if (process.env.NODE_ENV === 'development') {
      const mockServers = [
        { name: '🇩🇪 Германия', protocol: 'vless', alive: true, latency: 412, subdomain: 'de1' },
        { name: '🇫🇮 Финляндия', protocol: 'vless', alive: true, latency: 298, subdomain: 'fi1' },
        { name: '🇳🇱 Нидерланды', protocol: 'vless', alive: false, latency: 0, subdomain: '?' },
        { name: '🇵🇱 Польша', protocol: 'vless', alive: true, latency: 387, subdomain: 'pl1' },
        { name: '🇷🇺 Россия #1', protocol: 'vless', alive: true, latency: 440, subdomain: 'de3' },
        { name: '🇷🇺 Россия #2', protocol: 'vless', alive: true, latency: 402, subdomain: 'nl6' },
        { name: '🇷🇺 Россия #3', protocol: 'vless', alive: false, latency: 0, subdomain: 'pl1' },
      ]
      setServers(mockServers)
      setHistory(mockHistory([...mockServers.map((s) => s.name), ...initialServices.map((s) => s.name)]))
      setIncidents(mockIncidents())
      return
    }
    const fetchStatus = async () => {
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
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/history')
        const json = await res.json()
        setHistory(json)
      } catch { }
    }
    const fetchIncidents = async () => {
      try {
        const res = await fetch('/api/incidents')
        const json = await res.json()
        setIncidents(json)
      } catch { }
    }
    fetchStatus()
    fetchHistory()
    fetchIncidents()
    const statusInterval = setInterval(fetchStatus, 30000)
    const historyInterval = setInterval(fetchHistory, 5 * 60 * 1000)
    const incidentsInterval = setInterval(fetchIncidents, 5 * 60 * 1000)
    return () => {
      clearInterval(statusInterval)
      clearInterval(incidentsInterval)
      clearInterval(historyInterval)
    }
  }, [initialServices])

  const online = servers.filter((s) => s.alive).length
  const total = servers.length
  const allOnline = total > 0 && online === total
  const allOffline = total > 0 && online === 0
  const loading = total === 0

  const statusHeadline = loading
    ? 'загружаем данные...'
    : allOnline ? 'Всё работает'
    : allOffline ? 'Ничего не работает :('
    : 'Что-то не работает'

  return (
    <>
    <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto', padding: '7rem 24px 0' }}>
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, delay: 0.2 }}
        style={{ marginBottom: '40px' }}
      >
        <h1 className="page-hero-title">
          {statusHeadline}
        </h1>
        <div style={{ fontFamily: "'GT Eesti Pro Text', system-ui, sans-serif", fontSize: '13px', color: 'var(--text2)' }}>
          {!loading && <>{online} / {total} онлайн, </>}
          обновлено {now} МСК
        </div>
      </motion.div>

      {servers.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
          {services.length > 0 && (
            <div>
              <h2 className="font-display" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.75rem)', fontWeight: 700, color: 'var(--text)', margin: '0 0 20px' }}>
                Инфраструктура
              </h2>
              <div className="server-card divided-list">
                {services.map((svc, i) => <ServerCard key={i} {...svc} history={history[svc.name]} />)}
              </div>
            </div>
          )}
          {servers.length > 0 && (
            <div>
              <h2 className="font-display" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.75rem)', fontWeight: 700, color: 'var(--text)', margin: '0 0 20px' }}>
                VPN серверы
              </h2>
              <div className="server-card divided-list">
                {groupByLocation(servers).map(([base, group]) =>
                  group.length > 1
                    ? <ServerGroup key={base} baseName={base} servers={group} history={history} />
                    : <ServerCard key={base} {...group[0]} name={base} history={history[group[0].name]} />
                )}
              </div>
            </div>
          )}
          <IncidentHistory incidents={incidents} />
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text2)', fontFamily: "'GT Eesti Pro Text', system-ui, sans-serif", fontSize: '14px', background: 'rgba(8,0,26,0.55)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
          Данные загружаются. Пожалуйста, подождите...
        </div>
      )}
    </div>

    <div style={{ marginTop: '60px' }}>
      <Footer animate />
    </div>
    </>
  )
}
