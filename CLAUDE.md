# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server on :3000 (Turbopack)
npm run build        # production build
npm run lint         # ESLint
docker compose up -d # start xray-checker + status app
docker compose logs -f postq-vpn-status  # view app logs
```

## Architecture

Two Docker services defined in `docker-compose.yml`:
- **xray-checker** (`kutovoys/xray-checker`) — monitors VPN servers via RemnaWave subscription URL, exposes internal REST API at `http://xray-checker:2112` (Basic Auth protected)
- **postq-vpn-status** (this Next.js app) — fetches from xray-checker server-side, serves a public status page

**This project runs on a separate server from postq-site.** Caddy on that server reverse-proxies `status.postq.space` → `postq_vpn_status:3000`. Communication with postq-site happens entirely over the public internet via the `/api/status` endpoint (CORS-restricted to `https://postq.space`).

### Docker networks

- `internal` — isolated bridge network, xray-checker ↔ postq-vpn-status only, never exposed externally
- `caddy_net` — external network shared with Caddy on the status server; name may differ, adjust in `docker-compose.yml` to match the actual Caddy network (`docker network ls`)

### Data flow

```
xray-checker /api/v1/proxies  (Basic Auth, internal only)
        ↓
src/lib/xray.ts            (fetchXrayServers/fetchServices — shared by page.tsx, the API route, and the sampler)
        ↓                                      ↓
app/page.tsx                          src/lib/sampler.ts (every 5 min, via instrumentation.ts)
app/api/status/route.ts                       ↓
(public JSON, revalidate 60s)         src/lib/history-db.ts (SQLite, 90-day retention)
        ↓                                      ↓
postq-site VpnStatusWidget            app/api/history/route.ts (same-origin, daily uptime per server)
(fetches /api/status every 60s)               ↓
                                       src/components/UptimeBar.tsx (90-day bar under each ServerCard)
```

### Key files

- `src/lib/xray.ts` — shared fetch-and-normalise logic against xray-checker (`fetchXrayServers`) and the two service health checks (`fetchServices`). Used by `app/page.tsx`, `app/api/status/route.ts`, and `src/lib/sampler.ts` — the single place to update if a new xray-checker version changes field names.
- `app/api/status/route.ts` — the only public cross-origin API endpoint (CORS-restricted to `https://postq.space`). Returns 200 even on upstream errors so the widget never enters an error state.
- `app/page.tsx` — server component, calls `src/lib/xray.ts` directly. Refresh = page reload.
- `src/lib/sampler.ts` / `instrumentation.ts` — background sampler started once when the Next.js server boots (Next's `register()` hook). Snapshots all servers+services every 5 minutes into SQLite. No-ops quietly if `XRAY_CHECKER_*` env vars aren't set (e.g. plain `npm run dev` without Docker).
- `src/lib/history-db.ts` — SQLite (`better-sqlite3`) storage for snapshots, 90-day pruning, and daily aggregation (`getDailyHistory`). A day is `offline` only if every 5-min sample that day was dead; any dead sample mixed with alive ones is `partial` (incident, not full outage); day bucketing uses fixed Moscow time (`UTC+3`, no DST) to match the rest of the UI.
- `app/api/history/route.ts` — same-origin only (no CORS headers needed), returns `{ [serverName]: DayStatus[] }` for the last 90 days.
- `src/components/UptimeBar.tsx` — renders the 90-day bar; `src/components/ServerCard.tsx` takes an optional `history` prop to show it.
- `src/components/ServerCard.tsx` — otherwise purely presentational, no client JS needed beyond the optional history bar.

**Single-replica assumption:** the sampler and SQLite file assume exactly one running container. If this service is ever scaled to multiple replicas sharing the volume, multiple concurrent 5-minute samplers would write to the same SQLite file — fine for readers (WAL), but a real contention risk for concurrent writers.

**better-sqlite3 version pin:** pinned to `11.10.0` (not `^`) in `package.json` because it's the last major with a published Node 20 (ABI v115) musl prebuild matching the `node:20-alpine` base image — 12.x has no Node 20 prebuild, 13.x requires Node ≥22. Don't let `npm update`/renovate bump the major without also bumping the Dockerfile's base image.

### Environment variables (see `.env.example`)

| Variable | Description |
|---|---|
| `SUBSCRIPTION_URL` | RemnaWave subscription URL passed to xray-checker |
| `XRAY_CHECKER_USER` | Basic auth username for xray-checker |
| `XRAY_CHECKER_PASS` | Basic auth password for xray-checker |
| `XRAY_CHECKER_URL` | Internal URL of xray-checker (`http://xray-checker:2112` in Docker, `http://localhost:2112` locally) |
| `HISTORY_DB_PATH` | SQLite file path for uptime history (`/app/data/history.db` in Docker, backed by the `history-data` named volume; defaults to `./data/history.db` locally) |

None of these are exposed to the browser (`NEXT_PUBLIC_` prefix is intentionally avoided).

### Design system

Identical to `postq-site` — same CSS variables, GT Eesti Pro fonts, Tailwind colour tokens. The source of truth for colours/fonts is `app/globals.css`. Font OTF files are in `public/fonts/` (copied from postq-site).

### xray-checker API compatibility note

The field names in xray-checker's `/api/proxies` response may vary between versions. The normalisation in `src/lib/xray.ts` handles multiple aliases (`name`/`remark`/`tag`, `alive`/`online`, `latency`/`delay`). If a new xray-checker version breaks the response shape, update that one file — it's shared by every caller.

`fetchXrayServers` calls `/api/v1/proxies` (not `/api/v1/public/proxies`) — the "public" variant deliberately omits the server host/IP, and we need it to derive the `subdomain` display field (e.g. `de3` from `de3.postq.space`, shown next to each server's uptime bar). It needs the same Basic Auth as `/metrics` (already configured via `XRAY_CHECKER_USER`/`PASS`), which xray-checker requires for `/api/*` whenever `WEB_PUBLIC=true` (set in `docker-compose.yml`).

**Known tradeoff:** `src/lib/cdn-override.ts` hides the real origin of "Россия #1–#5" behind a CDN specifically because Beeline blocks non-Russian IPs directly — the whole point is that a Russian network observer shouldn't learn which real host backs which visible server name. Displaying `subdomain` for those same servers on the public status page exposes exactly that mapping (confirmed and accepted as a deliberate product decision, not an oversight — see conversation history if this needs revisiting).
