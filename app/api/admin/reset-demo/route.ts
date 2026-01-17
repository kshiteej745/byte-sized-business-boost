import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { businesses, reviews, deals, favorites, profiles } from '@/lib/schema'

export async function POST() {
  try {
    const cookieStore = cookies()
    const isAdmin = cookieStore.get('admin_session')?.value === 'authenticated'
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all data (cascade will handle related records)
    await db.delete(businesses)
    await db.delete(profiles)

    // Also explicitly delete others to be safe
    await db.delete(favorites)
    await db.delete(reviews)
    await db.delete(deals)

    return NextResponse.json({ success: true, message: 'Demo data reset. Run npm run db:seed to reload sample data.' })
  } catch (error) {
    console.error('Reset demo error:', error)
    return NextResponse.json({ error: 'Failed to reset demo data' }, { status: 500 })
  }
}
