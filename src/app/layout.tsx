import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { SecurityProvider } from '@/components/SecurityProvider'

export const metadata: Metadata = {
  metadataBase: new URL('https://sourhouse.in'),
  title: {
    template: '%s | Sour House',
    default: 'Sour House',
  },
  description: 'Sourdough bakery & cafe',
  keywords: ['bakery', 'sourdough', 'cafe', 'pastries', 'bread', 'Sour House'],
  authors: [{ name: 'Procrastinate Coders' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Sour House',
    description: 'Sourdough bakery & cafe',
    images: [{ url: '/images/logo.avif' }],
    url: 'https://sourhouse.in',
    siteName: 'Sour House',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sour House',
    description: 'Sourdough bakery & cafe',
    images: ['/images/logo.avif'],
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
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Bakery',
              name: 'Sour House',
              image: 'https://sourhouse.in/images/logo.avif',
              url: 'https://sourhouse.in',
              priceRange: '$$',
              servesCuisine: 'Bakery',
            }),
          }}
        />
        <SecurityProvider />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
