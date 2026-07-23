import Header from '@/components/Header'
import StatusClient from '@/components/StatusClient'
import { overrideCdnServers } from '@/lib/cdn-override'
import { fetchXrayServers, fetchServices, type ServerStatus } from '@/lib/xray'

export default async function StatusPage() {
  const [servers, services] = await Promise.all([
    fetchXrayServers({ cache: 'no-store' }),
    fetchServices().catch(() => [] as ServerStatus[]),
  ])
  await overrideCdnServers(servers)
  return (
    <main className="relative w-full min-h-screen">
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0, contain: 'paint' }} aria-hidden>
        <div className="spotlight-orb spotlight-orb-1" />
        <div className="spotlight-orb spotlight-orb-2" />
      </div>
      <Header />
      <StatusClient initialServers={servers} initialServices={services} />
    </main>
  )
}
