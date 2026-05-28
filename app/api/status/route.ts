import tls from 'tls'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// xray-checker can't reach these servers because Beeline CDN blocks non-Russian IPs.
// We check their origin servers directly via TLS handshake instead.
const CDN_ORIGIN_MAP: Record<string, string> = {
  'Россия #1': 'nl6.postq.space',
  'Россия #2': 'de2.postq.space',
}

function checkTlsConnect(hostname: string): Promise<{ alive: boolean; latency: number }> {
  return new Promise((resolve) => {
    const t = Date.now()
    const socket = tls.connect(
      { host: hostname, port: 443, servername: hostname, rejectUnauthorized: false },
      () => { socket.destroy(); resolve({ alive: true, latency: Date.now() - t }) }
    )
    socket.setTimeout(5000)
    socket.on('timeout', () => { socket.destroy(); resolve({ alive: false, latency: 0 }) })
    socket.on('error', () => { socket.destroy(); resolve({ alive: false, latency: 0 }) })
  })
}

export interface ServerStatus {
  name: string
  protocol: string
  alive: boolean
  latency: number
}

export interface StatusResponse {
  online: number
  total: number
  servers: ServerStatus[]
  services: ServerStatus[]
  checkedAt: string
}

async function fetchFromChecker(): Promise<ServerStatus[]> {
  const user = process.env.XRAY_CHECKER_USER
  const pass = process.env.XRAY_CHECKER_PASS
  const baseUrl = process.env.XRAY_CHECKER_URL

  if (!user || !pass || !baseUrl) {
    throw new Error('XRAY_CHECKER_URL, XRAY_CHECKER_USER and XRAY_CHECKER_PASS must be set')
  }

  const credentials = Buffer.from(`${user}:${pass}`).toString('base64')

  const res = await fetch(`${baseUrl}/api/v1/public/proxies`, {
    headers: { Authorization: `Basic ${credentials}` },
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error(`xray-checker returned ${res.status}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await res.json()
  const data: any[] = json.data ?? json

  return data.map((p) => ({
    name: p.name ?? p.remark ?? p.tag ?? 'Unknown',
    protocol: (p.protocol ?? p.type ?? 'unknown').toLowerCase(),
    alive: Boolean((p.alive ?? (p.status === 'online')) || Boolean(p.online)),
    latency: Number(p.latencyMs ?? p.latency ?? p.delay ?? 0),
  }))
}

async function fetchServices(): Promise<ServerStatus[]> {
  const [websiteResult, botResult] = await Promise.allSettled([
    (async () => {
      const t = Date.now()
      const res = await fetch('https://web.postq.space', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
        redirect: 'follow',
      })
      return { alive: res.ok, latency: Date.now() - t }
    })(),
    (async () => {
      const t = Date.now()
      const res = await fetch('https://web.postq.space/login', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
        redirect: 'follow',
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

async function overrideCdnServers(servers: ServerStatus[]): Promise<void> {
  const targets = servers.filter((s) =>
    Object.keys(CDN_ORIGIN_MAP).some((key) => s.name.includes(key))
  )
  if (targets.length === 0) return

  const results = await Promise.all(
    targets.map((s) => {
      const key = Object.keys(CDN_ORIGIN_MAP).find((k) => s.name.includes(k))!
      return checkTlsConnect(CDN_ORIGIN_MAP[key]).then((r) => ({ name: s.name, ...r }))
    })
  )

  for (const server of servers) {
    const r = results.find((x) => x.name === server.name)
    if (r) { server.alive = r.alive; server.latency = r.latency }
  }
}

export async function GET() {
  try {
    const [servers, services] = await Promise.all([fetchFromChecker(), fetchServices()])
    await overrideCdnServers(servers)
    const online = servers.filter((s) => s.alive).length

    const body: StatusResponse = {
      online,
      total: servers.length,
      servers,
      services,
      checkedAt: new Date().toISOString(),
    }

    return NextResponse.json(body, {
      headers: {
        'Access-Control-Allow-Origin': 'https://postq.space',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    })
  } catch (err) {
    console.error('[/api/status]', err)
    return NextResponse.json(
      { online: 0, total: 0, servers: [], checkedAt: new Date().toISOString() },
      { status: 200 } // return 200 so the widget doesn't show error state
    )
  }
}
