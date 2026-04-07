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

export default async function StatusPage() {
  const servers = await getServers()
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      <Header />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 15%, rgba(207,0,163,0.18), transparent 22%), radial-gradient(circle at 80% 10%, rgba(147,27,121,0.10), transparent 20%)' }} />
      </div>
      <StatusClient initialServers={servers} />
    </main>
  )
}
