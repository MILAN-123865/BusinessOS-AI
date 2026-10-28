import { Analytics } from '@vercel/analytics/react'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { QueryProvider } from '@/components/providers/query-provider'
import { AuthGuard } from '@/components/providers/auth-guard'
import { PermissionProvider } from '@/components/providers/permission-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'

export const metadata: Metadata = {
  title: 'BusinessOS AI',
  description: 'The AI-powered operating system for modern businesses',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/logos/logo-icon.png',
        type: 'image/png',
      },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F0F7FF' },
    { media: '(prefers-color-scheme: dark)', color: '#0B132B' },
  ],
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
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-background text-foreground antialiased selection:bg-primary/15 selection:text-primary">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <QueryProvider>
            <PermissionProvider>
              <AuthGuard>
                {children}
              </AuthGuard>
            </PermissionProvider>
          </QueryProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
