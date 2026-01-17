import { NextRequest, NextResponse } from 'next/server'
import {
  getTopRatedBusinesses,
  getMostReviewedBusinesses,
  getCategoryDistribution,
  getExpiringDeals,
  getMostFavoritedBusinesses,
} from '@/lib/reports'
import { reportFiltersSchema } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportType, filters } = body

    // Validate filters
    const validatedFilters = reportFiltersSchema.parse(filters || {})

    // Convert date strings to Date objects
    const processedFilters = {
      ...validatedFilters,
      startDate: validatedFilters.startDate ? new Date(validatedFilters.startDate) : undefined,
      endDate: validatedFilters.endDate ? new Date(validatedFilters.endDate) : undefined,
      expiryWindow: validatedFilters.expiryWindow || 7,
    }

    let results: any[] = []

    switch (reportType) {
      case 'top-rated':
        results = getTopRatedBusinesses(processedFilters)
        break
      case 'most-reviewed':
        results = getMostReviewedBusinesses(processedFilters)
        break
      case 'category-dist':
        results = getCategoryDistribution(processedFilters)
        break
      case 'expiring-deals':
        results = getExpiringDeals(processedFilters)
        break
      case 'most-favorited':
        results = getMostFavoritedBusinesses(processedFilters)
        break
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid filters', details: error.errors }, { status: 400 })
    }
    console.error('Report generation error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
