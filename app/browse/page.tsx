import Link from 'next/link'
import { db } from '@/lib/db'
import { businesses, reviews } from '@/lib/schema'
import { sql, eq, and, desc, asc, like } from 'drizzle-orm'
import BrowseClient from './BrowseClient'

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { category?: string; neighborhood?: string; sort?: string; search?: string }
}) {
  const { category, neighborhood, sort = 'name', search } = searchParams

  let query = db.select({
    id: businesses.id,
    name: businesses.name,
    category: businesses.category,
    neighborhood: businesses.neighborhood,
    address: businesses.address,
    avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`.as('avg_rating'),
    reviewCount: sql<number>`COUNT(${reviews.id})`.as('review_count'),
    favoriteCount: sql<number>`0`.as('favorite_count'), // Will be populated if needed
  })
    .from(businesses)
    .leftJoin(reviews, eq(businesses.id, reviews.businessId))
    .groupBy(businesses.id)

  const conditions = []

  if (category) {
    conditions.push(eq(businesses.category, category))
  }

  if (neighborhood) {
    conditions.push(eq(businesses.neighborhood, neighborhood))
  }

  if (search) {
    conditions.push(
      sql`(${businesses.name} LIKE ${'%' + search + '%'} OR ${businesses.description} LIKE ${'%' + search + '%'})`
    )
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any
  }

  let results = await query.all()

  // Apply sorting
  switch (sort) {
    case 'rating':
      results = results.sort((a, b) => b.avgRating - a.avgRating)
      break
    case 'reviews':
      results = results.sort((a, b) => b.reviewCount - a.reviewCount)
      break
    case 'newest':
      // Would need createdAt in select for this
      break
    case 'name':
    default:
      results = results.sort((a, b) => a.name.localeCompare(b.name))
      break
  }

  // Get unique categories and neighborhoods
  const allBusinesses = await db.select().from(businesses)
  const categories = Array.from(new Set(allBusinesses.map(b => b.category))).sort()
  const neighborhoods = Array.from(new Set(allBusinesses.map(b => b.neighborhood))).sort()

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-4xl font-heading font-semibold text-gray-900 mb-2">Find what you're looking for</h1>
      <p className="text-lg text-gray-600 mb-8">Browse Richmond businesses by category, neighborhood, or search</p>
      
      <BrowseClient
        businesses={results.map(b => ({
          id: b.id,
          name: b.name,
          category: b.category,
          neighborhood: b.neighborhood,
          address: b.address,
          avgRating: Number(b.avgRating) || 0,
          reviewCount: Number(b.reviewCount) || 0,
        }))}
        categories={categories}
        neighborhoods={neighborhoods}
        currentCategory={category || ''}
        currentNeighborhood={neighborhood || ''}
        currentSort={sort}
        currentSearch={search || ''}
      />
    </div>
  )
}
