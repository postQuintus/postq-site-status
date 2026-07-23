import { fetchXrayServers, fetchServices } from './xray'
import { overrideCdnServers } from './cdn-override'
import { recordSnapshot, pruneOldSnapshots } from './history-db'

const SAMPLE_INTERVAL_MS = 5 * 60 * 1000

let started = false

async function tick(): Promise<void> {
  try {
    const [servers, services] = await Promise.all([
      fetchXrayServers({ cache: 'no-store' }),
      fetchServices(),
    ])
    if (servers.length === 0 && services.length === 0) return
    await overrideCdnServers(servers)
    recordSnapshot([...servers, ...services])
    pruneOldSnapshots(90)
  } catch (err) {
    console.error('[sampler]', err)
  }
}

export function startSampler(): void {
  if (started) return
  started = true

  if (!process.env.XRAY_CHECKER_URL || !process.env.XRAY_CHECKER_USER || !process.env.XRAY_CHECKER_PASS) {
    return
  }

  let inFlight = false
  const guardedTick = async () => {
    if (inFlight) return
    inFlight = true
    try {
      await tick()
    } finally {
      inFlight = false
    }
  }

  guardedTick()
  setInterval(guardedTick, SAMPLE_INTERVAL_MS)
}
