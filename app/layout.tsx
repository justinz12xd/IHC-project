import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { MainNavbar } from '@/components/main-navbar'
import { MainFooter } from '@/components/main-footer'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'AgroMarket Eventos',
  description: 'Created by Us',
  generator: 'My mind',
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
