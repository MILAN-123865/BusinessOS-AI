import { Analytics } from '@vercel/analytics/react'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { QueryProvider } from '@/components/providers/query-provider'
import { AuthGuard } from '@/components/providers/auth-guard'
import { PermissionProvider } from '@/components/providers/permission-provider'

export const metadata: Metadata = {
  title: 'BusinessOS AI',
  description: 'The AI-powered operating system for modern businesses',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: [{ color: '#FFFFFF' }],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <body className="font-sans bg-background text-foreground antialiased selection:bg-primary/15 selection:text-primary">
        <QueryProvider>
          <PermissionProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
          </PermissionProvider>
        </QueryProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
