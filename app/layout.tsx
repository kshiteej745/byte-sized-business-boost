import type { Metadata } from 'next'
import { Lato, Work_Sans } from 'next/font/google'
import './globals.css'
import Navigation from './components/Navigation'

const lato = Lato({ 
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-lato',
})

const workSans = Work_Sans({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-work-sans',
})

export const metadata: Metadata = {
  title: 'Neighborly - Richmond, VA',
  description: 'Discover and support local businesses in Richmond, Virginia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${lato.variable} ${workSans.variable} font-sans`}>
        <Navigation />
        <main className="min-h-screen pb-8">
          {children}
        </main>
        <footer className="bg-gray-800 text-white py-8 mt-16 border-t border-gray-700">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-300">&copy; 2025 Neighborly. Made with care in Richmond.</p>
            <p className="text-sm text-gray-500 mt-2">Supporting the businesses that make our city home</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
