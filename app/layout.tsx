import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'postq vpn | статус серверов',
  description: 'Мониторинг состояния VPN-серверов postq в реальном времени',
  icons: { icon: '/icons/icon.svg' },
  openGraph: {
    title: 'postq vpn | статус серверов',
    description: 'Мониторинг состояния VPN-серверов postq в реальном времени',
    url: 'https://status.postq.space',
    siteName: 'postq vpn status',
  },
}

export const viewport: Viewport = {
  themeColor: '#04000f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
