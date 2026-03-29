import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'Sour House',
  description: 'Sourdough bakery & cafe',
  openGraph: {
    title: 'Sour House',
    description: 'Sourdough bakery & cafe',
    images: [{ url: '/images/logo.avif' }],
  },
  icons: {
    icon: '/images/logo.avif',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr-CA">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
