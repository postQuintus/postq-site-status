import Header from '@/components/Header'
import StatusClient from '@/components/StatusClient'
import type { ServerStatus } from './api/status/route'

async function getServers(): Promise<ServerStatus[]> {
  const user = process.env.XRAY_CHECKER_USER
  const pass = process.env.XRAY_CHECKER_PASS
  const baseUrl = process.env.XRAY_CHECKER_URL
  if (!user || !pass || !baseUrl) return []
  try {
    const credentials = Buffer.from(`${user}:${pass}`).toString('base64')
    const res = await fetch(`${baseUrl}/api/v1/public/proxies`, {
      headers: { Authorization: `Basic ${credentials}` },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const json = await res.json()
    const data: any[] = json.data ?? json
    return data.map((p) => ({
      name: p.name ?? p.remark ?? p.tag ?? 'Unknown',
      protocol: (p.protocol ?? p.type ?? 'unknown').toLowerCase(),
      alive: Boolean((p.alive ?? (p.status === 'online')) || Boolean(p.online)),
      latency: Number(p.latencyMs ?? p.latency ?? p.delay ?? 0),
    }))
  } catch {
    return []
  }
}

async function getServices(): Promise<ServerStatus[]> {
  const [websiteResult, botResult] = await Promise.allSettled([
    (async () => {
      const t = Date.now()
      const res = await fetch('https://web.postq.space', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
        redirect: 'follow',
        cache: 'no-store',
      })
      return { alive: res.ok, latency: Date.now() - t }
    })(),
    (async () => {
      const t = Date.now()
      const res = await fetch('https://web.postq.space/login', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
        redirect: 'follow',
        cache: 'no-store',
      })
      return { alive: res.ok, latency: Date.now() - t }
    })(),
  ])

  return [
    {
      name: '🌐 Личный кабинет',
      protocol: 'WWW',
      alive: websiteResult.status === 'fulfilled' && websiteResult.value.alive,
      latency: websiteResult.status === 'fulfilled' ? websiteResult.value.latency : 0,
    },
    {
      name: '🤖 Бот',
      protocol: 'TG',
      alive: botResult.status === 'fulfilled' && botResult.value.alive,
      latency: botResult.status === 'fulfilled' ? botResult.value.latency : 0,
    },
  ]
}

export default async function StatusPage() {
  const [servers, services] = await Promise.all([
    getServers(),
    getServices().catch(() => [] as ServerStatus[]),
  ])
  return (
    <main className="relative w-full min-h-screen">
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden>
        <div className="spotlight-orb spotlight-orb-1" />
        <div className="spotlight-orb spotlight-orb-2" />
      </div>
      <Header />
      <StatusClient initialServers={servers} initialServices={services} />
    </main>
  )
}
