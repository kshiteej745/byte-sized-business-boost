import Link from 'next/link'
import { cookies } from 'next/headers'

export default function Navigation() {
  const cookieStore = cookies()
  const isAdmin = cookieStore.get('admin_session')?.value === 'authenticated'

  return (
    <nav className="bg-primary-500 text-white shadow-soft-lg border-b border-primary-600" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-heading font-semibold hover:text-primary-100 focus:outline-none focus:ring-2 focus:ring-white rounded-lg px-3 py-2 transition-colors">
            Neighborly
          </Link>
          <div className="flex space-x-2">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/browse">Browse</NavLink>
            <NavLink href="/deals">Deals</NavLink>
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
      className="hover:text-primary-100 focus:outline-none focus:ring-2 focus:ring-white rounded-lg px-3 py-2 transition-colors font-medium"
    >
      {children}
    </Link>
  )
}
