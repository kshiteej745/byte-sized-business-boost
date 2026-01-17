import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Byte-Sized Business Boost - Richmond, VA',
  description: 'Discover and support local businesses in Richmond, Virginia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen pb-8">
          {children}
        </main>
        <footer className="bg-gray-800 text-white py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2025 Byte-Sized Business Boost. All rights reserved.</p>
            <p className="text-sm text-gray-400 mt-2">Supporting Richmond, Virginia businesses</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
