import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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

  const res = await fetch(`${baseUrl}/api/proxies`, {
    headers: { Authorization: `Basic ${credentials}` },
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error(`xray-checker returned ${res.status}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any[] = await res.json()

  return data.map((p) => ({
    name: p.name ?? p.remark ?? p.tag ?? 'Unknown',
    protocol: (p.protocol ?? p.type ?? 'unknown').toLowerCase(),
    alive: Boolean(p.alive ?? p.status === 'online' ?? p.online),
    latency: Number(p.latency ?? p.delay ?? 0),
  }))
}

export async function GET() {
  try {
    const servers = await fetchFromChecker()
    const online = servers.filter((s) => s.alive).length

    const body: StatusResponse = {
      online,
      total: servers.length,
      servers,
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
