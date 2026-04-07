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
xray-checker /api/proxies  (Basic Auth, internal only)
        ↓
app/page.tsx               (server component, cache: 'no-store', renders full page)
app/api/status/route.ts    (public JSON: {online, total, servers, checkedAt}, revalidate 60s)
        ↓
postq-site VpnStatusWidget (fetches /api/status every 60s, shows "X/Y серверов онлайн")
```

### Key files

- `app/api/status/route.ts` — the only public API endpoint. Proxies xray-checker with Basic Auth, normalises the response shape (handles varying field names across xray-checker versions), returns 200 even on upstream errors so the widget never enters an error state.
- `app/page.tsx` — server component, calls xray-checker directly (same normalisation logic as the route). Refresh = page reload.
- `src/components/ServerCard.tsx` — purely presentational, no client JS needed.

### Environment variables (see `.env.example`)

| Variable | Description |
|---|---|
| `SUBSCRIPTION_URL` | RemnaWave subscription URL passed to xray-checker |
| `XRAY_CHECKER_USER` | Basic auth username for xray-checker |
| `XRAY_CHECKER_PASS` | Basic auth password for xray-checker |
| `XRAY_CHECKER_URL` | Internal URL of xray-checker (`http://xray-checker:2112` in Docker, `http://localhost:2112` locally) |

None of these are exposed to the browser (`NEXT_PUBLIC_` prefix is intentionally avoided).

### Design system

Identical to `postq-site` — same CSS variables, GT Eesti Pro fonts, Tailwind colour tokens. The source of truth for colours/fonts is `app/globals.css`. Font OTF files are in `public/fonts/` (copied from postq-site).

### xray-checker API compatibility note

The field names in xray-checker's `/api/proxies` response may vary between versions. The normalisation in both `app/page.tsx` and `app/api/status/route.ts` handles multiple aliases (`name`/`remark`/`tag`, `alive`/`online`, `latency`/`delay`). If a new xray-checker version breaks the response shape, update both places.
