export interface ServerStatus {
  name: string
  protocol: string
  alive: boolean
  latency: number
  /** Short host label for display (e.g. "de3"), or "?" when the underlying
   *  address is a raw IP rather than a "<label>.postq.space" hostname. */
  subdomain: string
}

const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/

function extractSubdomain(server: unknown): string {
  if (typeof server !== 'string' || server.length === 0) return '?'
  if (IPV4_RE.test(server) || server.includes(':')) return '?' // IPv4 or IPv6 literal
  const label = server.split('.')[0]
  return label || '?'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(data: any[]): ServerStatus[] {
  return data.map((p) => ({
    name: p.name ?? p.remark ?? p.tag ?? 'Unknown',
    protocol: (p.protocol ?? p.type ?? 'unknown').toLowerCase(),
    alive: Boolean((p.alive ?? (p.status === 'online')) || Boolean(p.online)),
    latency: Number(p.latencyMs ?? p.latency ?? p.delay ?? 0),
    subdomain: extractSubdomain(p.server ?? p.address ?? p.host),
  }))
}

export async function fetchXrayServers(fetchInit: RequestInit = { cache: 'no-store' }): Promise<ServerStatus[]> {
  const user = process.env.XRAY_CHECKER_USER
  const pass = process.env.XRAY_CHECKER_PASS
  const baseUrl = process.env.XRAY_CHECKER_URL
  if (!user || !pass || !baseUrl) return []

  try {
    const credentials = Buffer.from(`${user}:${pass}`).toString('base64')
    // Not /api/v1/public/proxies — that endpoint deliberately omits the server
    // host/IP. This one requires the same Basic Auth as /metrics (already
    // configured via XRAY_CHECKER_USER/PASS) but includes it, which we need
    // to derive the display subdomain.
    const res = await fetch(`${baseUrl}/api/v1/proxies`, {
      ...fetchInit,
      headers: { Authorization: `Basic ${credentials}` },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) throw new Error(`xray-checker returned ${res.status}`)
    const json = await res.json()
    return normalize(json.data ?? json)
  } catch (err) {
    console.error('[xray]', err)
    return []
  }
}

export async function fetchServices(): Promise<ServerStatus[]> {
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
      subdomain: '',
    },
    {
      name: '🤖 Бот',
      protocol: 'TG',
      alive: botResult.status === 'fulfilled' && botResult.value.alive,
      latency: botResult.status === 'fulfilled' ? botResult.value.latency : 0,
      subdomain: '',
    },
  ]
}
