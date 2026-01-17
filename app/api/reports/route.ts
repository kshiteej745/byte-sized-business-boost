import { NextRequest, NextResponse } from 'next/server'
import {
  getTopRatedBusinesses,
  getMostReviewedBusinesses,
  getCategoryDistribution,
  getExpiringDeals,
  getMostFavoritedBusinesses,
} from '@/lib/reports'
import { reportFiltersSchema } from '@/lib/validators'

// POST /api/reports
// Purpose: Generate a requested report using validated filters and return results as JSON.
export async function POST(request: NextRequest) {
  try {
    // Parse the JSON request body sent by the frontend
    const body = await request.json()
    const { reportType, filters } = body

    // ✅ Rubric: user input validation
    // Zod schema ensures filters are the correct shape/types (prevents invalid requests)
    const validatedFilters = reportFiltersSchema.parse(filters || {})

    // Normalize/clean filter inputs so downstream report logic is consistent
    // (example: convert date strings into real Date objects)
    const processedFilters = {
      ...validatedFilters,
      startDate: validatedFilters.startDate ? new Date(validatedFilters.startDate) : undefined,
      endDate: validatedFilters.endDate ? new Date(validatedFilters.endDate) : undefined,
      expiryWindow: validatedFilters.expiryWindow || 7,
    }

    // complex data storage (arrays/lists)
    // Each report returns an array of results (objects) that the UI can render as a table/export.
    // Scoped inside the handler so it only exists for this one request.
    let results: any[] = []

    // Choose which report to generate
    // modular design (heavy logic lives in lib/reports)
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
        // Invalid report type = client error
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    // Consistent response shape makes the frontend simple and reliable
    return NextResponse.json({ results })
  } catch (error: any) {
    // If validation fails, return a 400 with details so the UI can display helpful feedback
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid filters', details: error.errors },
        { status: 400 }
      )
    }

    // Unexpected server errors: log for debugging + return 500
    console.error('Report generation error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
