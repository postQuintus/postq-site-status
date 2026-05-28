import tls from 'tls'
import type { ServerStatus } from '../../app/api/status/route'

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

export async function overrideCdnServers(servers: ServerStatus[]): Promise<void> {
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
