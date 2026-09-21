import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ConditionalNav } from '@/components/ConditionalNav'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' })
const plusJakarta = Plus_Jakarta_Sans({ variable: '--font-jakarta', subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'TrackTime',
  description: 'Personal time tracking for freelancers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable} ${geistMono.variable} h-full`}>
      <body className="flex flex-col min-h-full antialiased">
        <ConditionalNav />
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  )
}
