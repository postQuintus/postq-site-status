'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import UptimeBar from './UptimeBar'
import { parseNamePrefix } from './ServerCard'
import type { ServerStatus } from '../../app/api/status/route'
import type { HistoryByName } from '../lib/history-db'

interface ServerGroupProps {
  baseName: string
  servers: ServerStatus[]
  history: HistoryByName
}

/** Multiple servers sharing one flag collapse into a single location card.
 *  The header shows only the flag + country name; each member inside shows
 *  just its subdomain and uptime strip, not its raw (possibly suffixed) name. */
export default function ServerGroup({ baseName, servers, history }: ServerGroupProps) {
  const [open, setOpen] = useState(false)
  const online = servers.filter((s) => s.alive).length
  const total = servers.length
  const dotColor = online === total ? '#22c55e' : online > 0 ? '#f59e0b' : '#ef4444'
  const prefix = parseNamePrefix(baseName)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '24px 18px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          font: 'inherit',
          color: 'inherit',
        }}
      >
        {/* Disclosure chevron */}
        <span style={{ flexShrink: 0, width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronDown
            size={16}
            color="var(--text2)"
            style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s ease' }}
          />
        </span>

        {/* Flag + country name */}
        <span
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: "'GT Eesti Pro Text', system-ui, -apple-system, sans-serif",
            fontSize: '14px',
            fontWeight: 400,
            color: 'var(--text)',
            overflow: 'hidden',
          }}
        >
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
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {prefix.cleanName}
          </span>
        </span>

        {/* Aggregate status */}
        <span
          style={{
            flexShrink: 0,
            fontFamily: "'GT Eesti Pro Text', system-ui, -apple-system, sans-serif",
            fontSize: '13px',
            fontWeight: 400,
            color: dotColor,
          }}
        >
          {online === total ? `${online}/${total} онлайн` : online === 0 ? 'Ничего не работает' : 'Что-то не работает'}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '20px 18px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {servers.map((s, i) => (
                <UptimeBar key={i} subdomain={s.subdomain} history={history[s.name] ?? []} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
