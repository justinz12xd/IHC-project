import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { MainNavbar } from '@/components/main-navbar'
import { MainFooter } from '@/components/main-footer'
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
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <MainNavbar />
        <main className="min-h-screen">
          {children}
        </main>
        <MainFooter />
        <Analytics />
      </body>
    </html>
  )
}
