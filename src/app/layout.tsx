import type { Metadata } from 'next'
import { Playfair_Display, Courier_Prime, Special_Elite } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const courier = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-courier',
})

const special = Special_Elite({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-special',
})

export const metadata: Metadata = {
  title: 'Cold Case',
  description: 'A Procedural Mystery Engine',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${courier.variable} ${special.variable}`}>
      <body>{children}</body>
    </html>
  )
}