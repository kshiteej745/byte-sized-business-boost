import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { businesses } from '@/lib/schema'
import { businessSchema } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const isAdmin = cookieStore.get('admin_session')?.value === 'authenticated'
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = businessSchema.parse(body)

    const [newBusiness] = await db.insert(businesses).values({
      ...validated,
      createdAt: new Date(),
    }).returning()

    return NextResponse.json({ success: true, business: newBusiness }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('Business creation error:', error)
    return NextResponse.json({ error: 'Failed to create business' }, { status: 500 })
  }
}
