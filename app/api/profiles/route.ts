import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/schema'
import { profileSchema } from '@/lib/validators'
import { generateMathChallenge, verifyMathChallenge, checkHoneypot, checkRateLimit, getClientIdentifier } from '@/lib/botguard'
import { cookies } from 'next/headers'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request.headers)
    const rateLimit = checkRateLimit(clientId)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before creating a profile.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Honeypot check
    if (!checkHoneypot(body.honeypot)) {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
    }

    // Validate math challenge
    if (!body.mathToken || !body.mathAnswer) {
      return NextResponse.json({ error: 'Math challenge required' }, { status: 400 })
    }

    const isValidChallenge = verifyMathChallenge(body.mathToken, parseInt(body.mathAnswer))
    if (!isValidChallenge) {
      return NextResponse.json({ error: 'Invalid math challenge answer' }, { status: 400 })
    }

    // Validate profile data
    const validated = profileSchema.parse({
      nickname: body.nickname,
    })

    // Check if nickname already exists
    const existing = await db.select()
      .from(profiles)
      .where(eq(profiles.nickname, validated.nickname))
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Nickname already taken' }, { status: 400 })
    }

    // Create profile
    const [newProfile] = await db.insert(profiles).values({
      nickname: validated.nickname,
      createdAt: new Date(),
    }).returning()

    // Set cookie
    const cookieStore = cookies()
    cookieStore.set('profile_id', String(newProfile.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })

    return NextResponse.json({ success: true, profile: newProfile }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('Profile creation error:', error)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}
