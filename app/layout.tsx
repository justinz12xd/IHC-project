import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { MainNavbar } from '@/components/main-navbar'
import { MainFooter } from '@/components/main-footer'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ThemeProvider } from '@/lib/theme/theme-context'
import { LanguageProvider } from '@/lib/i18n/language-context'
import ErrorBoundary from '@/components/error-boundary'
import RegisterServiceWorker from '@/components/register-sw'
import './globals.css'

export const metadata: Metadata = {
  title: 'AgroMarket Eventos',
  description: 'Plataforma de Gestión de Eventos Agroproductivos',
  generator: 'Next.js',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'IHC Events',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
}

export default function RootLayout({
  children,
}: Readonly<{ 
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#16a34a" />
      </head>
      <body className={`font-sans antialiased`}>
        <ErrorBoundary>
          <ThemeProvider>
            <LanguageProvider>
              <MainNavbar />
              <Breadcrumbs />
              <main className="min-h-screen">
                {children}
              </main>
              <MainFooter />
            </LanguageProvider>
          </ThemeProvider>
        </ErrorBoundary>
        <RegisterServiceWorker />
        <Analytics />
      </body>
    </html>
  )
}
