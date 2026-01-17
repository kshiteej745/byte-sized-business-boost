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
    .where(sql`${deals.isActive} = 1 AND (${deals.expiresOn} IS NULL OR ${deals.expiresOn} > unixepoch())`)

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
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-heading font-semibold text-gray-900 mb-5 leading-tight">
          Your Richmond neighbors are here
        </h1>
        <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
          Find great local spots. Share what you love. Support the businesses that make our city home.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/browse" className="btn btn-primary">
            Explore businesses
          </Link>
          <Link href="/finder" className="btn btn-secondary">
            Find something specific
          </Link>
          <Link href="/deals" className="btn btn-secondary">
            See current deals
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <StatCard
          title="Local businesses"
          value={totalBusinesses[0]?.count || 0}
          description="Right here in Richmond"
        />
        <StatCard
          title="Real reviews"
          value={totalReviews[0]?.count || 0}
          description="From people like you"
        />
        <StatCard
          title="Active deals"
          value={activeDeals[0]?.count || 0}
          description="Save money, support local"
        />
      </div>

      <section className="mb-16">
        <h2 className="text-3xl font-heading font-semibold text-gray-900 mb-8">Spotlight on Richmond</h2>
        {featuredBusinesses.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-gray-700 mb-5 text-lg">We're just getting started. Help us grow!</p>
            <Link href="/admin" className="btn btn-primary">
              Add a business
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBusinesses.map((business) => (
              <Link
                key={business.id}
                href={`/business/${business.id}`}
                className="card group focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{business.name}</h3>
                <p className="text-gray-600 text-sm mb-3">
                  {business.category} • {business.neighborhood}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 text-lg">★</span>
                  <span className="font-semibold text-gray-900">
                    {business.avgRating ? business.avgRating.toFixed(1) : 'No rating yet'}
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({business.reviewCount || 0} {business.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="bg-warm-100 rounded-2xl p-10 border border-warm-200 mt-16">
        <h2 className="text-3xl font-heading font-semibold text-gray-900 mb-6">How this works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="font-heading font-semibold text-lg mb-3 text-gray-900">For neighbors</h3>
            <ul className="space-y-2 text-gray-700 leading-relaxed">
              <li>• Browse by what you're looking for or where you are</li>
              <li>• Read honest reviews from people in your neighborhood</li>
              <li>• Find deals and save money while supporting local</li>
              <li>• Save your favorites to revisit later</li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg mb-3 text-gray-900">For business owners</h3>
            <ul className="space-y-2 text-gray-700 leading-relaxed">
              <li>• Add your business to our directory (admin access needed)</li>
              <li>• Share deals and special offers with your community</li>
              <li>• See what customers are saying about your spot</li>
              <li>• Connect with neighbors who want to support you</li>
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
      <div className="text-4xl font-heading font-semibold text-primary-500 mb-3">{value}</div>
      <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}
