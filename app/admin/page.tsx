import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { businesses } from '@/lib/schema'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
  const cookieStore = cookies()
  const isAdmin = cookieStore.get('admin_session')?.value === 'authenticated'

  if (!isAdmin) {
    redirect('/admin/login')
  }

  const allBusinesses = await db.select().from(businesses)

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminDashboard initialBusinesses={allBusinesses} />
    </div>
  )
}
