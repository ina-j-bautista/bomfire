import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BOMFIRE — Tutorial to Cart',
  description: 'Paste a maker tutorial. Get a ready-to-buy parts list.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
