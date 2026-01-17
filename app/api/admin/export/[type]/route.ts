import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { businesses, reviews, deals } from '@/lib/schema'
import { toCSV } from '@/lib/reports'

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const cookieStore = cookies()
    const isAdmin = cookieStore.get('admin_session')?.value === 'authenticated'
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type } = params
    let csv = ''
    let headers: string[] = []

    switch (type) {
      case 'businesses': {
        const data = await db.select().from(businesses)
        headers = ['id', 'name', 'category', 'neighborhood', 'address', 'phone', 'website', 'description', 'tags_csv', 'created_at']
        csv = toCSV(
          data.map(b => ({
            id: b.id,
            name: b.name,
            category: b.category,
            neighborhood: b.neighborhood,
            address: b.address,
            phone: b.phone || '',
            website: b.website || '',
            description: b.description || '',
            tags_csv: b.tagsCsv || '',
            created_at: typeof b.createdAt === 'number' 
              ? new Date(b.createdAt * 1000).toISOString()
              : (b.createdAt as any).toISOString(),
          })),
          headers
        )
        break
      }
      case 'reviews': {
        const data = await db.select().from(reviews)
        headers = ['id', 'business_id', 'rating', 'title', 'body', 'display_name', 'created_at']
        csv = toCSV(
          data.map(r => ({
            id: r.id,
            business_id: r.businessId,
            rating: r.rating,
            title: r.title,
            body: r.body,
            display_name: r.displayName,
            created_at: typeof r.createdAt === 'number'
              ? new Date(r.createdAt * 1000).toISOString()
              : (r.createdAt as any).toISOString(),
          })),
          headers
        )
        break
      }
      case 'deals': {
        const data = await db.select().from(deals)
        headers = ['id', 'business_id', 'title', 'description', 'coupon_code', 'expires_on', 'is_active']
        csv = toCSV(
          data.map(d => ({
            id: d.id,
            business_id: d.businessId,
            title: d.title,
            description: d.description,
            coupon_code: d.couponCode || '',
            expires_on: d.expiresOn
              ? (typeof d.expiresOn === 'number'
                  ? new Date(d.expiresOn * 1000).toISOString()
                  : (d.expiresOn as any).toISOString())
              : '',
            is_active: d.isActive ? '1' : '0',
          })),
          headers
        )
        break
      }
      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 })
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}
