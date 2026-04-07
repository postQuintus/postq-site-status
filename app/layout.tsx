import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Статус серверов — PostQ VPN',
  description: 'Мониторинг состояния VPN-серверов PostQ в реальном времени',
  icons: { icon: '/icons/icon.svg' },
  openGraph: {
    title: 'Статус серверов — PostQ VPN',
    description: 'Мониторинг состояния VPN-серверов PostQ в реальном времени',
    url: 'https://status.postq.space',
    siteName: 'PostQ VPN Status',
  },
}

export const viewport: Viewport = {
  themeColor: '#04000f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
