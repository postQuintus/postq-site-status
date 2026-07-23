'use client'

import { parseNamePrefix } from './ServerCard'
import { cleanBaseName, formatDuration } from '../lib/format'
import type { Incident } from '../lib/history-db'

interface IncidentHistoryProps {
  incidents: Incident[]
}

function formatDate(unixMs: number): string {
  return new Date(unixMs).toLocaleDateString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Moscow',
  })
}

function formatTime(unixMs: number): string {
  return new Date(unixMs).toLocaleTimeString('ru-RU', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow',
  })
}

/** Groups incidents (already ordered newest-first) into consecutive runs by
 *  their MSK calendar date, preserving that order. */
function groupByDate(incidents: Incident[]): [string, Incident[]][] {
  const groups: [string, Incident[]][] = []
  for (const incident of incidents) {
    const date = formatDate(incident.startAt)
    const last = groups[groups.length - 1]
    if (last && last[0] === date) last[1].push(incident)
    else groups.push([date, [incident]])
  }
  return groups
}

export default function IncidentHistory({ incidents }: IncidentHistoryProps) {
  return (
    <div>
      <h2 className="font-display" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.75rem)', fontWeight: 700, color: 'var(--text)', margin: '0 0 20px' }}>
        История инцидентов
      </h2>

      {incidents.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text2)', fontFamily: "'GT Eesti Pro Text', system-ui, sans-serif", fontSize: '13px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '14px' }}>
          Инцидентов за последние 90 дней не было
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {groupByDate(incidents).map(([date, dayIncidents]) => (
            <div key={date} className="server-card" style={{ padding: '28px' }}>
              <h3 style={{ fontFamily: "'GT Eesti Pro Display', system-ui, sans-serif", fontSize: '15px', fontWeight: 700, color: 'var(--text)', margin: 0, paddingBottom: '14px', borderBottom: '1px solid var(--glass-border)' }}>
                {date}
              </h3>
              <div className="divided-list">
                {dayIncidents.map((incident, i) => {
                  const prefix = parseNamePrefix(cleanBaseName(incident.name))
                  return (
                    <div key={i} style={{ padding: '16px 0 16px 14px' }}>
                      <p style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontFamily: "'GT Eesti Pro Text', system-ui, -apple-system, sans-serif", fontSize: '13px', color: 'var(--text2)', margin: '0 0 14px' }}>
                        <span>Зафиксировано в {formatTime(incident.startAt)} МСК</span>
                        <span>простой {formatDuration(incident.durationMs)}</span>
                      </p>
                      <p style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontFamily: "'GT Eesti Pro Text', system-ui, -apple-system, sans-serif", fontSize: '14px', fontWeight: 500, color: 'var(--text)', margin: 0 }}>
                        {prefix.type === 'flag' && (
                          <img
                            src={`https://flagcdn.com/20x15/${prefix.code}.png`}
                            srcSet={`https://flagcdn.com/40x30/${prefix.code}.png 2x`}
                            width={20}
                            height={15}
                            alt={prefix.code.toUpperCase()}
                            style={{ flexShrink: 0, borderRadius: '2px', display: 'block' }}
                          />
                        )}
                        {prefix.type === 'icon' && (
                          <prefix.Icon size={16} color="#8b7ea3" style={{ flexShrink: 0 }} />
                        )}
                        <span>
                          {prefix.cleanName}
                          {incident.subdomain && (
                            <span style={{ textTransform: 'uppercase' }}> ({incident.subdomain})</span>
                          )}
                          {' '}не отвечал на проверки статуса
                        </span>
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
