'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'

/**
 * Футер, синхронизированный с postq-site (src/components/Footer.tsx).
 * Отличие: сайт статуса живёт на отдельном домене, поэтому все ссылки
 * на разделы основного сайта — абсолютные, на postq.space.
 */

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Продукт',
    links: [
      { label: 'Личный кабинет', href: 'https://web.postq.space' },
      { label: 'Цены', href: 'https://postq.space/#pricing' },
      { label: 'Как подключить', href: 'https://postq.space/#howto' },
      { label: 'FAQ', href: 'https://postq.space/#faq' },
      { label: 'Статус серверов', href: 'https://status.postq.space' },
    ],
  },
  {
    title: 'Помощь',
    links: [
      { label: 'Справочный центр', href: 'https://postq.space/help' },
      { label: 'VPN на роутере', href: 'https://postq.space/help/vpn-on-router' },
      { label: 'Генератор конфига XKeen', href: 'https://postq.space/keys' },
      { label: 'Узнать мой IP', href: 'https://postq.space/ip' },
      { label: 'Поддержка', href: 'https://t.me/postq_vpn_support_bot' },
    ],
  },
]

/** Точка-разделитель между горизонтальными ссылками. Прячется, когда ряд складывается в колонку. */
function Dot() {
  return (
    <span aria-hidden className="footer-dot" style={{ color: 'rgba(215,194,240,0.25)', fontSize: 12, userSelect: 'none' }}>
      ·
    </span>
  )
}

function FooterContent() {
  return (
    <div className="footer-inner">
      <div className="footer-grid">
        <div className="footer-brand">
          {/* Повторяет бренд-блок шапки: иконка 32px + font-display 16px без жирного */}
          <div className="footer-brand-row">
            <div className="relative h-8 w-8 shrink-0">
              <Image src="/icons/icon.svg" alt="postq logo" fill className="object-contain" />
            </div>
            <span className="font-display" style={{ fontSize: '16px', color: 'var(--text)' }}>postq vpn</span>
          </div>
          <p className="footer-tagline">
            Доступ к любым сайтам. Без логов и слежки.
          </p>
          <div className="footer-actions">
            <a
              href="https://t.me/postq_vpn_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="install-guide-btn"
            >
              <Send size={15} strokeWidth={2} /> Бот в Telegram
            </a>
            <div className="footer-socials">
              <a
                href="https://t.me/postq_news"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-nav-link"
              >
                Новости в Telegram
              </a>
              <Dot />
              <a
                href="https://www.threads.com/@postq_vpn"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-nav-link"
              >
                Threads
              </a>
            </div>
          </div>
        </div>

        {COLUMNS.map(col => (
          <nav key={col.title} className="footer-col" aria-label={col.title}>
            <p className="footer-col-title">{col.title}</p>
            {col.links.map(link => (
              <a key={link.href} href={link.href} className="footer-nav-link">
                {link.label}
              </a>
            ))}
          </nav>
        ))}
      </div>

      <div className="footer-bottom">
        <span className="footer-link" style={{ cursor: 'default' }}>© 2026 postq vpn</span>
        <div className="footer-bottom-links">
          <a href="https://postq.space/privacy" className="footer-link">политика конфиденциальности</a>
          <Dot />
          <a href="https://postq.space/terms" className="footer-link">пользовательское соглашение</a>
          <Dot />
          <a href="mailto:hello@postq.space" className="footer-link">hello@postq.space</a>
        </div>
      </div>
    </div>
  )
}

interface FooterProps {
  /** Fades in on mount — used on the status page's initial scroll-in sequence. */
  animate?: boolean
}

export default function Footer({ animate = false }: FooterProps) {
  if (animate) {
    return (
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="site-footer"
      >
        <FooterContent />
      </motion.footer>
    )
  }

  return (
    <footer className="site-footer">
      <FooterContent />
    </footer>
  )
}
