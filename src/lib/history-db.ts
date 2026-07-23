import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'
import type { ServerStatus } from './xray'

export interface DayStatus {
  date: string
  status: 'online' | 'partial' | 'offline' | 'nodata'
  uptimePct: number | null
  totalSamples: number
  aliveSamples: number
}

export type HistoryByName = Record<string, DayStatus[]>

const MSK_OFFSET_MS = 3 * 60 * 60 * 1000

let db: Database.Database | null = null

function getDb(): Database.Database {
  if (db) return db

  const dbPath = process.env.HISTORY_DB_PATH ?? path.join(process.cwd(), 'data', 'history.db')
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('busy_timeout = 5000')
  db.exec(`
    CREATE TABLE IF NOT EXISTS snapshots (
      checked_at INTEGER NOT NULL,
      name       TEXT    NOT NULL,
      alive      INTEGER NOT NULL,
      latency    INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_snapshots_name_checked_at ON snapshots(name, checked_at);
  `)

  const columns = db.prepare('PRAGMA table_info(snapshots)').all() as { name: string }[]
  if (!columns.some((c) => c.name === 'subdomain')) {
    db.exec(`ALTER TABLE snapshots ADD COLUMN subdomain TEXT NOT NULL DEFAULT ''`)
  }

  return db
}

export function recordSnapshot(servers: ServerStatus[], checkedAt: number = Date.now()): void {
  const insert = getDb().prepare(
    'INSERT INTO snapshots (checked_at, name, alive, latency, subdomain) VALUES (?, ?, ?, ?, ?)'
  )
  const insertMany = getDb().transaction((rows: ServerStatus[]) => {
    for (const s of rows) insert.run(checkedAt, s.name, s.alive ? 1 : 0, s.latency, s.subdomain ?? '')
  })
  insertMany(servers)
}

export function pruneOldSnapshots(retentionDays = 90): void {
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000
  getDb().prepare('DELETE FROM snapshots WHERE checked_at < ?').run(cutoff)
}

/** Calendar date (YYYY-MM-DD) in Moscow time (fixed UTC+3, no DST) for a unix-ms timestamp. */
function mskDateString(unixMs: number): string {
  return new Date(unixMs + MSK_OFFSET_MS).toISOString().slice(0, 10)
}

export function getDailyHistory(days = 90): HistoryByName {
  const now = Date.now()
  const windowStart = now - days * 24 * 60 * 60 * 1000

  const rows = getDb()
    .prepare(
      `SELECT
         name,
         date(checked_at / 1000, 'unixepoch', '+3 hours') AS day,
         COUNT(*)  AS total,
         SUM(alive) AS aliveCount
       FROM snapshots
       WHERE checked_at >= ?
       GROUP BY name, day`
    )
    .all(windowStart) as { name: string; day: string; total: number; aliveCount: number }[]

  const byName = new Map<string, Map<string, { total: number; aliveCount: number }>>()
  for (const row of rows) {
    if (!byName.has(row.name)) byName.set(row.name, new Map())
    byName.get(row.name)!.set(row.day, { total: row.total, aliveCount: row.aliveCount })
  }

  const dateList: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    dateList.push(mskDateString(now - i * 24 * 60 * 60 * 1000))
  }

  const result: HistoryByName = {}
  for (const [name, dayMap] of byName) {
    result[name] = dateList.map((date) => {
      const day = dayMap.get(date)
      if (!day || day.total === 0) {
        return { date, status: 'nodata', uptimePct: null, totalSamples: 0, aliveSamples: 0 }
      }
      const status: DayStatus['status'] =
        day.aliveCount === day.total ? 'online' : day.aliveCount === 0 ? 'offline' : 'partial'
      return {
        date,
        status,
        uptimePct: (day.aliveCount / day.total) * 100,
        totalSamples: day.total,
        aliveSamples: day.aliveCount,
      }
    })
  }
  return result
}

export interface Incident {
  name: string
  subdomain: string
  startAt: number
  endAt: number
  durationMs: number
}

// Must match src/lib/sampler.ts's SAMPLE_INTERVAL_MS — kept separate to avoid
// history-db.ts <-> sampler.ts importing each other.
const SAMPLE_INTERVAL_MS = 5 * 60 * 1000

/** Incidents = maximal runs of consecutive dead snapshots for a server or
 *  service, kept only when the run spans 2+ samples (i.e. was down for more
 *  than one 5-minute tick — a lone dead sample could just be a ~5-minute
 *  blip). Services (Личный кабинет, Бот) are included too — they just have
 *  no subdomain (recorded as ''), which the UI renders as "не отвечал"
 *  without a host label instead of omitting the row.
 *  Classic "gaps and islands": rn - rn2 is constant within a consecutive run
 *  of dead samples, so grouping by it isolates each run. Duration adds one
 *  sample interval to the observed span, since the server was already down
 *  by the first dead sample and only confirmed recovered at the next check
 *  after the last one.
 *
 *  Two false-positive guards, both needed because xray-checker itself (not
 *  just the sampler) restarts alongside this container and briefly reports
 *  bogus data rather than going silent:
 *  - mass_blip: every server/service is sampled in the same tick (one
 *    recordSnapshot() call per sampler run, same checked_at for all rows), so
 *    a checker restart or subscription reload shows up as most/all names
 *    dying in the same batch. A run is dropped if any of its ticks had ≥50%
 *    of that batch dead — that's the checker warming up, not a per-server
 *    incident.
 *  - first_alive: a newly-added subscription server has no incident history
 *    yet, so its first real samples (before xray-checker has actually probed
 *    it) can read dead too. A run is dropped unless the server was observed
 *    alive at least once before the run started — otherwise it's "not yet
 *    online", not "went down". */
export function getIncidents(days = 90, limit = 50): Incident[] {
  const windowStart = Date.now() - days * 24 * 60 * 60 * 1000

  const rows = getDb()
    .prepare(
      `WITH ordered AS (
         SELECT
           name, subdomain, checked_at, alive,
           ROW_NUMBER() OVER (PARTITION BY name ORDER BY checked_at) AS rn,
           ROW_NUMBER() OVER (PARTITION BY name, alive ORDER BY checked_at) AS rn2
         FROM snapshots
         WHERE checked_at >= ?
       ),
       batch_stats AS (
         SELECT checked_at,
                COUNT(*) AS total,
                SUM(CASE WHEN alive = 0 THEN 1 ELSE 0 END) AS dead
         FROM snapshots
         WHERE checked_at >= ?
         GROUP BY checked_at
       ),
       dead_runs AS (
         SELECT
           o.name, o.subdomain, o.checked_at, (o.rn - o.rn2) AS grp,
           CASE WHEN b.total > 0 AND (CAST(b.dead AS REAL) / b.total) >= 0.5 THEN 1 ELSE 0 END AS mass_blip
         FROM ordered o
         JOIN batch_stats b ON b.checked_at = o.checked_at
         WHERE o.alive = 0
       ),
       first_alive AS (
         SELECT name, MIN(checked_at) AS first_alive_at
         FROM snapshots
         WHERE alive = 1
         GROUP BY name
       )
       SELECT
         d.name,
         MAX(d.subdomain) AS subdomain,
         MIN(d.checked_at) AS startAt,
         MAX(d.checked_at) AS endAt,
         COUNT(*) AS sampleCount
       FROM dead_runs d
       JOIN first_alive fa ON fa.name = d.name
       GROUP BY d.name, d.grp
       HAVING COUNT(*) >= 2
         AND MAX(d.mass_blip) = 0
         AND fa.first_alive_at < MIN(d.checked_at)
       ORDER BY startAt DESC
       LIMIT ?`
    )
    .all(windowStart, windowStart, limit) as { name: string; subdomain: string; startAt: number; endAt: number; sampleCount: number }[]

  return rows.map((r) => ({
    name: r.name,
    subdomain: r.subdomain,
    startAt: r.startAt,
    endAt: r.endAt,
    durationMs: r.endAt - r.startAt + SAMPLE_INTERVAL_MS,
  }))
}
