import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sloth OS — An Operating System for Doing Absolutely Nothing',
  description: 'A browser-based operating environment that actively prevents productivity. Featuring a window manager, virtual filesystem, terminal, games, and AI-powered procrastination tools.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden">
        {children}
      </body>
    </html>
  )
}
