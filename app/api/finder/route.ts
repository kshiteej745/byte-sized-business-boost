import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { businesses, reviews, deals } from '@/lib/schema'
import { eq, and, sql } from 'drizzle-orm'
import { parseNaturalLanguageQuery, scoreBusinesses } from '@/lib/recommender'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    let filters: any = {}

    if (body.type === 'search' && body.query) {
      // Parse natural language query
      filters = parseNaturalLanguageQuery(body.query)
    } else if (body.type === 'wizard' && body.filters) {
      filters = body.filters
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Get all businesses matching base filters
    let query = db.select({
      id: businesses.id,
      name: businesses.name,
      category: businesses.category,
      neighborhood: businesses.neighborhood,
      address: businesses.address,
      tagsCsv: businesses.tagsCsv,
      avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`.as('avg_rating'),
      reviewCount: sql<number>`COUNT(${reviews.id})`.as('review_count'),
      hasActiveDeals: sql<boolean>`CASE WHEN COUNT(${deals.id}) > 0 THEN 1 ELSE 0 END`.as('has_active_deals'),
    })
      .from(businesses)
      .leftJoin(reviews, eq(businesses.id, reviews.businessId))
      .leftJoin(deals, and(
        eq(businesses.id, deals.businessId),
        eq(deals.isActive, true)
      ))
      .groupBy(businesses.id)

    const conditions = []

    if (filters.category) {
      conditions.push(eq(businesses.category, filters.category))
    }

    if (filters.neighborhood) {
      conditions.push(eq(businesses.neighborhood, filters.neighborhood))
    }

    if (filters.dealsOnly) {
      // This will be handled in scoring
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any
    }

    const allBusinesses = await query.all()

    // Score businesses
    const scored = scoreBusinesses(filters)

    // Map scores to business data
    const results = scored.slice(0, 20).map((score) => {
      const business = allBusinesses.find(b => b.id === score.businessId)
      if (!business) return null

      return {
        id: business.id,
        name: business.name,
        category: business.category,
        neighborhood: business.neighborhood,
        address: business.address,
        avgRating: Number(business.avgRating) || 0,
        reviewCount: Number(business.reviewCount) || 0,
        score: score.score,
        reasons: score.reasons,
      }
    }).filter(Boolean)

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Finder error:', error)
    return NextResponse.json({ error: 'Failed to search businesses' }, { status: 500 })
  }
}
