import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Comptoir Krem & Kanel — Oupsi. Juste trop bon.',
  description: 'Artisan pastries in Sainte-Thérèse.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr-CA">
      <body>{children}</body>
    </html>
  )
}
