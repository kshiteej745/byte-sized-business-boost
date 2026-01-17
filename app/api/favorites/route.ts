import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { favorites, profiles } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const profileIdCookie = cookieStore.get('profile_id')
    
    if (!profileIdCookie) {
      return NextResponse.json({ error: 'Profile required. Please create a profile first.' }, { status: 401 })
    }

    const profileId = parseInt(profileIdCookie.value)
    const body = await request.json()
    const businessId = parseInt(body.businessId)

    if (isNaN(businessId)) {
      return NextResponse.json({ error: 'Invalid business ID' }, { status: 400 })
    }

    // Check if already favorited
    const existing = await db.select()
      .from(favorites)
      .where(and(
        eq(favorites.profileId, profileId),
        eq(favorites.businessId, businessId)
      ))
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Already favorited' }, { status: 400 })
    }

    // Add favorite
    await db.insert(favorites).values({
      profileId,
      businessId,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Favorite error:', error)
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const profileIdCookie = cookieStore.get('profile_id')
    
    if (!profileIdCookie) {
      return NextResponse.json({ error: 'Profile required' }, { status: 401 })
    }

    const profileId = parseInt(profileIdCookie.value)
    const { searchParams } = new URL(request.url)
    const businessId = parseInt(searchParams.get('businessId') || '')

    if (isNaN(businessId)) {
      return NextResponse.json({ error: 'Invalid business ID' }, { status: 400 })
    }

    // Remove favorite
    await db.delete(favorites)
      .where(and(
        eq(favorites.profileId, profileId),
        eq(favorites.businessId, businessId)
      ))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unfavorite error:', error)
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 })
  }
}
