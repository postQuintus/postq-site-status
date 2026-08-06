import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Stopgap for kutovoys/xray-checker#188: its JSON subscription parser only
 * reads `realitySettings.publicKey`, not the `password` alias some panels
 * (RemnaWave included) emit instead — REALITY outbounds with `password` get
 * silently dropped from monitoring. This route sits between xray-checker and
 * the real SUBSCRIPTION_URL, backfilling `publicKey` from `password` so
 * REALITY servers get checked again. Remove once upstream ships a fix.
 *
 * Internal-only: gated by a shared-secret header (SUBSCRIPTION_HEADERS on
 * the xray-checker container) since this app is also reachable publicly via
 * Caddy, and the subscription payload contains live server/user credentials.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function patchRealitySettings(node: any): void {
  if (Array.isArray(node)) {
    for (const item of node) patchRealitySettings(item)
    return
  }
  if (node === null || typeof node !== 'object') return

  if (
    'shortId' in node &&
    typeof node.password === 'string' &&
    node.password.length > 0 &&
    (typeof node.publicKey !== 'string' || node.publicKey.length === 0)
  ) {
    node.publicKey = node.password
  }

  for (const value of Object.values(node)) patchRealitySettings(value)
}

export async function GET(req: NextRequest) {
  const secret = process.env.SUBSCRIPTION_PROXY_SECRET
  const subscriptionUrl = process.env.SUBSCRIPTION_URL
  if (!secret || !subscriptionUrl) {
    return new NextResponse(null, { status: 404 })
  }
  if (req.headers.get('x-subscription-proxy-secret') !== secret) {
    return new NextResponse(null, { status: 404 })
  }

  try {
    const upstream = await fetch(subscriptionUrl, {
      headers: {
        'User-Agent': req.headers.get('user-agent') ?? 'Xray-Checker',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    })
    const contentType = upstream.headers.get('content-type') ?? ''
    const body = await upstream.text()

    if (!contentType.includes('json')) {
      return new NextResponse(body, { status: upstream.status, headers: { 'Content-Type': contentType } })
    }

    const json = JSON.parse(body)
    patchRealitySettings(json)
    return NextResponse.json(json, { status: upstream.status })
  } catch (err) {
    console.error('[/api/subscription-proxy]', err)
    return new NextResponse(null, { status: 502 })
  }
}
