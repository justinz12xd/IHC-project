import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { MainNavbar } from '@/components/main-navbar'
import { MainFooter } from '@/components/main-footer'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { ThemeProvider } from '@/lib/theme/theme-context'
import { LanguageProvider } from '@/lib/i18n/language-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'AgroMarket Eventos',
  description: 'Plataforma de Gestión de Eventos Agroproductivos',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{ 
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
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
        <Analytics />
      </body>
    </html>
  )
}
