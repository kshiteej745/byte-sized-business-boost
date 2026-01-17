import Link from 'next/link'
import { cookies } from 'next/headers'

export default function Navigation() {
  const cookieStore = cookies()
  const isAdmin = cookieStore.get('admin_session')?.value === 'authenticated'

  return (
    <nav className="bg-primary-600 text-white shadow-lg" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold hover:text-primary-200 focus:outline-none focus:ring-2 focus:ring-white rounded px-2">
            Byte-Sized Business Boost
          </Link>
          <div className="flex space-x-4">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/browse">Browse</NavLink>
            <NavLink href="/deals">Deals</NavLink>
            <NavLink href="/favorites">Favorites</NavLink>
            <NavLink href="/finder">Finder</NavLink>
            <NavLink href="/reports">Reports</NavLink>
            <NavLink href="/help">Help</NavLink>
            {isAdmin && <NavLink href="/admin">Admin</NavLink>}
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="hover:text-primary-200 focus:outline-none focus:ring-2 focus:ring-white rounded px-2 py-1 transition-colors"
    >
      {children}
    </Link>
  )
}
