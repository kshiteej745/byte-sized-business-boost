import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { businesses, reviews, deals, favorites, profiles } from '@/lib/schema'
import { eq, and, desc, asc, sql } from 'drizzle-orm'
import Link from 'next/link'
import { cookies } from 'next/headers'
import BusinessDetailClient from './BusinessDetailClient'
import { sanitizeHtml } from '@/lib/botguard'

export default async function BusinessDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { sort?: string }
}) {
  const businessId = parseInt(params.id)
  if (isNaN(businessId)) {
    notFound()
  }

  const business = await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1)

  if (business.length === 0) {
    notFound()
  }

  const biz = business[0]

  // Get reviews with sorting
  const sort = searchParams.sort || 'newest'
  let reviewsQuery = db.select().from(reviews).where(eq(reviews.businessId, businessId))

  const allReviews = await reviewsQuery.all()

  let sortedReviews = [...allReviews]
  switch (sort) {
    case 'highest':
      sortedReviews.sort((a, b) => b.rating - a.rating)
      break
    case 'lowest':
      sortedReviews.sort((a, b) => a.rating - b.rating)
      break
    case 'newest':
    default:
      sortedReviews.sort((a, b) => {
        const dateA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt as any).getTime()
        const dateB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt as any).getTime()
        return dateB - dateA
      })
      break
  }

  // Get active deals
  const activeDeals = await db.select()
    .from(deals)
    .where(
      and(
        eq(deals.businessId, businessId),
        eq(deals.isActive, true),
        sql`(${deals.expiresOn} IS NULL OR ${deals.expiresOn} > datetime('now'))`
      )
    )

  // Calculate stats
  const avgRating = allReviews.length > 0
    ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    : 0

  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: allReviews.filter(r => r.rating === rating).length,
  }))

  // Check if user has favorite (client-side check via profile)
  const cookieStore = cookies()
  const profileIdCookie = cookieStore.get('profile_id')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/browse" className="text-primary-600 hover:text-primary-700">
          ← Back to Browse
        </Link>
      </div>

      <div className="card mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{biz.name}</h1>
            <p className="text-gray-600 mb-2">
              {biz.category} • {biz.neighborhood}
            </p>
            <p className="text-gray-700">{biz.address}</p>
          </div>
          <div className="text-right">
            {avgRating > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl font-bold">{avgRating.toFixed(1)}</span>
                <span className="text-yellow-500 text-2xl">★</span>
              </div>
            )}
            <p className="text-gray-600 text-sm">
              {allReviews.length} review{allReviews.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {biz.description && (
          <p className="text-gray-700 mb-4">{biz.description}</p>
        )}

        {(biz.phone || biz.website) && (
          <div className="flex flex-wrap gap-4 text-sm">
            {biz.phone && (
              <a href={`tel:${biz.phone}`} className="text-primary-600 hover:text-primary-700">
                📞 {biz.phone}
              </a>
            )}
            {biz.website && (
              <a
                href={biz.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700"
              >
                🌐 Website
              </a>
            )}
          </div>
        )}

        {biz.tagsCsv && (
          <div className="mt-4 flex flex-wrap gap-2">
            {biz.tagsCsv.split(',').map((tag, i) => (
              <span key={i} className="badge badge-primary">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      {activeDeals.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Deals</h2>
          <div className="space-y-4">
            {activeDeals.map((deal) => {
              const expiresOn = deal.expiresOn
                ? (typeof deal.expiresOn === 'number'
                    ? new Date(deal.expiresOn * 1000)
                    : new Date(deal.expiresOn))
                : null
              const isExpiringSoon = expiresOn && expiresOn.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000

              return (
                <div key={deal.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{deal.title}</h3>
                    {isExpiringSoon && (
                      <span className="badge badge-warning">Expiring Soon</span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{deal.description}</p>
                  {deal.couponCode && (
                    <p className="font-mono text-primary-600 font-semibold mb-2">
                      Code: {deal.couponCode}
                    </p>
                  )}
                  {expiresOn && (
                    <p className="text-sm text-gray-600">
                      Expires: {expiresOn.toLocaleDateString()}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="card mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>

        {ratingCounts.some(r => r.count > 0) && (
          <div className="mb-6 space-y-2">
            {ratingCounts.map(({ rating, count }) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm font-medium w-12">{rating} ★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-yellow-500 h-4 rounded-full"
                    style={{ width: `${allReviews.length > 0 ? (count / allReviews.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}

        <BusinessDetailClient
          businessId={businessId}
          reviews={sortedReviews.map(r => ({
            id: r.id,
            rating: r.rating,
            title: sanitizeHtml(r.title),
            body: sanitizeHtml(r.body),
            displayName: sanitizeHtml(r.displayName),
            createdAt: typeof r.createdAt === 'number' ? new Date(r.createdAt * 1000) : new Date(r.createdAt as any),
          }))}
          currentSort={sort}
          profileId={profileIdCookie?.value || null}
        />
      </div>
    </div>
  )
}
