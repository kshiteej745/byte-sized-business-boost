import Link from 'next/link'
import { db } from '@/lib/db'
import { businesses, reviews, deals } from '@/lib/schema'
import { sql, desc } from 'drizzle-orm'

export default async function HomePage() {
  // Get featured stats
  const totalBusinesses = await db.select({ count: sql<number>`COUNT(*)` }).from(businesses)
  const totalReviews = await db.select({ count: sql<number>`COUNT(*)` }).from(reviews)
  const activeDeals = await db.select({ count: sql<number>`COUNT(*)` })
    .from(deals)
    .where(sql`${deals.isActive} = 1 AND (${deals.expiresOn} IS NULL OR ${deals.expiresOn} > datetime('now'))`)

  const featuredBusinesses = await db.select({
    id: businesses.id,
    name: businesses.name,
    category: businesses.category,
    neighborhood: businesses.neighborhood,
    avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`.as('avg_rating'),
    reviewCount: sql<number>`COUNT(${reviews.id})`.as('review_count'),
  })
    .from(businesses)
    .leftJoin(reviews, sql`${businesses.id} = ${reviews.businessId}`)
    .groupBy(businesses.id)
    .orderBy(desc(sql`${sql`COALESCE(AVG(${reviews.rating}), 0)`} * ${sql`COUNT(${reviews.id})`}`))
    .limit(6)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Byte-Sized Business Boost
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover and support local businesses in Richmond, Virginia
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/browse" className="btn btn-primary">
            Browse Businesses
          </Link>
          <Link href="/finder" className="btn btn-secondary">
            Find Business
          </Link>
          <Link href="/deals" className="btn btn-secondary">
            View Deals
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard
          title="Local Businesses"
          value={totalBusinesses[0]?.count || 0}
          description="Supporting Richmond's economy"
        />
        <StatCard
          title="Community Reviews"
          value={totalReviews[0]?.count || 0}
          description="Shared experiences and ratings"
        />
        <StatCard
          title="Active Deals"
          value={activeDeals[0]?.count || 0}
          description="Special offers available now"
        />
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Businesses</h2>
        {featuredBusinesses.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">No businesses yet. Be the first to add one!</p>
            <Link href="/admin" className="btn btn-primary">
              Add Business (Admin)
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBusinesses.map((business) => (
              <Link
                key={business.id}
                href={`/business/${business.id}`}
                className="card hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{business.name}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  {business.category} • {business.neighborhood}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">★</span>
                  <span className="font-medium">
                    {business.avgRating ? business.avgRating.toFixed(1) : 'No rating'}
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({business.reviewCount || 0} reviews)
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="bg-primary-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">For Visitors</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Browse local businesses by category or neighborhood</li>
              <li>Read reviews and ratings from the community</li>
              <li>Find deals and coupons to save money</li>
              <li>Save your favorite businesses</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">For Business Owners</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Create a business profile (Admin access required)</li>
              <li>Post active deals and coupons</li>
              <li>Respond to customer reviews</li>
              <li>Track your business analytics</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({ title, value, description }: { title: string; value: number; description: string }) {
  return (
    <div className="card text-center">
      <div className="text-3xl font-bold text-primary-600 mb-2">{value}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
