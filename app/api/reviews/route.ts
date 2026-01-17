import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reviews } from '@/lib/schema'
import { reviewSchema } from '@/lib/validators'
import { verifyMathChallenge, checkHoneypot, checkRateLimit, getClientIdentifier } from '@/lib/botguard'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request.headers)
    const rateLimit = checkRateLimit(clientId)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before submitting again.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Honeypot check
    if (!checkHoneypot(body.honeypot)) {
      // Silently reject (don't reveal it's a honeypot)
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

    // Validate review data
    const validated = reviewSchema.parse({
      businessId: parseInt(body.businessId),
      rating: parseInt(body.rating),
      title: body.title,
      body: body.body,
      displayName: body.displayName,
    })

    // Verify business exists
    const { businesses } = await import('@/lib/schema')
    const business = await db.select().from(businesses).where(eq(businesses.id, validated.businessId)).limit(1)
    if (business.length === 0) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Insert review
    const [newReview] = await db.insert(reviews).values({
      businessId: validated.businessId,
      rating: validated.rating,
      title: validated.title,
      body: validated.body,
      displayName: validated.displayName,
      createdAt: new Date(),
    }).returning()

    return NextResponse.json({ success: true, review: newReview }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('Review submission error:', error)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
