import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

export const metadata: Metadata = {
  title: {
    default: 'SurplusFlow – Surplus Funds Finder',
    template: '%s | SurplusFlow',
  },
  description: 'The #1 proprietary platform for finding, tracking, and recovering unclaimed surplus funds from tax delinquent sales, foreclosure auctions, and sheriff sales nationwide.',
  keywords: ['surplus funds', 'excess proceeds', 'foreclosure surplus', 'unclaimed funds', 'tax sale surplus'],
  authors: [{ name: 'SurplusFlow' }],
  creator: 'SurplusFlow',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'SurplusFlow – Surplus Funds Finder',
    description: 'Find, track, and recover unclaimed surplus funds nationwide.',
    siteName: 'SurplusFlow',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0284c7',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <ThemeProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: { borderRadius: '10px', background: '#1f2937', color: '#fff' },
                success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
