'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import ServerCard, { parseNamePrefix } from './ServerCard'
import type { ServerStatus } from '../../app/api/status/route'

interface ServerGroupProps {
  baseName: string
  servers: ServerStatus[]
}

export default function ServerGroup({ baseName, servers }: ServerGroupProps) {
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
        className="server-card"
        style={{ width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit', color: 'inherit' }}
      >
        <span
          className={online > 0 ? 'dot-wrapper dot-pulse' : 'dot-wrapper'}
          style={{ flexShrink: 0, position: 'relative', width: '8px', height: '8px' }}
        >
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: dotColor, boxShadow: `0 0 6px ${dotColor}b3` }} />
        </span>

        <span
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
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
          {prefix.type === 'icon' && (
            <prefix.Icon size={16} color="var(--text2)" style={{ flexShrink: 0 }} />
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {prefix.cleanName} · {total}
          </span>
        </span>

        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontFamily: "'GT Eesti Pro Text', system-ui, -apple-system, sans-serif",
              fontSize: '13px',
              fontWeight: 400,
              color: online === total ? 'var(--text2)' : '#ef4444',
            }}
          >
            {online}/{total} онлайн
          </span>
          <ChevronDown
            size={16}
            color="var(--text2)"
            style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s ease' }}
          />
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {servers.map((server, i) => <ServerCard key={i} {...server} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
