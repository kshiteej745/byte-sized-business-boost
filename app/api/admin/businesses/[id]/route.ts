import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { businesses } from '@/lib/schema'
import { businessSchema } from '@/lib/validators'
import { eq } from 'drizzle-orm'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const isAdmin = cookieStore.get('admin_session')?.value === 'authenticated'
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const businessId = parseInt(params.id)
    if (isNaN(businessId)) {
      return NextResponse.json({ error: 'Invalid business ID' }, { status: 400 })
    }

    const body = await request.json()
    const validated = businessSchema.parse(body)

    const [updated] = await db.update(businesses)
      .set(validated)
      .where(eq(businesses.id, businessId))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, business: updated })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('Business update error:', error)
    return NextResponse.json({ error: 'Failed to update business' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const isAdmin = cookieStore.get('admin_session')?.value === 'authenticated'
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const businessId = parseInt(params.id)
    if (isNaN(businessId)) {
      return NextResponse.json({ error: 'Invalid business ID' }, { status: 400 })
    }

    await db.delete(businesses).where(eq(businesses.id, businessId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Business deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete business' }, { status: 500 })
  }
}
