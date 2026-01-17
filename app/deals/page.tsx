import Link from 'next/link'
import { db } from '@/lib/db'
import { deals, businesses } from '@/lib/schema'
import { eq, and, sql, desc } from 'drizzle-orm'

export default async function DealsPage() {
  // Get all active deals
  // expiresOn is stored as Unix timestamp (seconds), so compare with unixepoch()
  const activeDeals = await db.select({
    dealId: deals.id,
    dealTitle: deals.title,
    dealDescription: deals.description,
    couponCode: deals.couponCode,
    expiresOn: deals.expiresOn,
    businessId: businesses.id,
    businessName: businesses.name,
    category: businesses.category,
    neighborhood: businesses.neighborhood,
    address: businesses.address,
  })
    .from(deals)
    .innerJoin(businesses, eq(deals.businessId, businesses.id))
    .where(
      and(
        eq(deals.isActive, true),
        sql`(${deals.expiresOn} IS NULL OR ${deals.expiresOn} > unixepoch())`
      )
    )
    .orderBy(desc(deals.expiresOn))

  // Separate expiring soon (within 7 days)
  const now = Date.now()
  const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000

  const expiringSoon = activeDeals.filter(deal => {
    if (!deal.expiresOn) return false
    const expiryTime = typeof deal.expiresOn === 'number'
      ? deal.expiresOn * 1000
      : new Date(deal.expiresOn).getTime()
    return expiryTime <= sevenDaysFromNow
  })

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-4xl font-heading font-semibold text-gray-900 mb-2">Current deals</h1>
      <p className="text-lg text-gray-600 mb-8">Save money while supporting your neighborhood businesses</p>

      {activeDeals.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-700 mb-5 text-lg">No deals available right now. Check back soon!</p>
          <Link href="/browse" className="btn btn-primary">
            Explore businesses
          </Link>
        </div>
      ) : (
        <>
          {expiringSoon.length > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-heading font-semibold text-gray-900 mb-5 flex items-center gap-3">
                <span className="badge badge-warning">Ending soon</span>
                <span className="text-lg font-normal text-gray-600">
                  {expiringSoon.length} {expiringSoon.length === 1 ? 'deal' : 'deals'} ending this week
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {expiringSoon.map((deal) => (
                  <DealCard key={deal.dealId} deal={deal} isExpiringSoon={true} />
                ))}
              </div>
            </div>
          )}

          <h2 className="text-2xl font-heading font-semibold text-gray-900 mb-6">All current deals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeDeals.map((deal) => (
              <DealCard key={deal.dealId} deal={deal} isExpiringSoon={expiringSoon.some(d => d.dealId === deal.dealId)} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function DealCard({ deal, isExpiringSoon }: { deal: any; isExpiringSoon: boolean }) {
  const expiresOn = deal.expiresOn
    ? (typeof deal.expiresOn === 'number'
        ? new Date(deal.expiresOn * 1000)
        : new Date(deal.expiresOn))
    : null

  return (
    <Link
      href={`/business/${deal.businessId}`}
      className="card group focus:outline-none focus:ring-2 focus:ring-primary-400"
    >
      {isExpiringSoon && (
        <div className="mb-3">
          <span className="badge badge-warning">Ending soon</span>
        </div>
      )}
      
      <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{deal.dealTitle}</h3>
      <p className="text-gray-700 mb-4">{deal.dealDescription}</p>
      
      {deal.couponCode && (
        <div className="bg-primary-50 border border-primary-200 rounded p-3 mb-4">
          <p className="text-sm text-gray-600 mb-1">Coupon Code:</p>
          <p className="font-mono text-primary-700 font-bold text-lg">{deal.couponCode}</p>
        </div>
      )}

      <div className="border-t border-gray-200 pt-4">
        <p className="font-semibold text-gray-900 mb-1">{deal.businessName}</p>
        <p className="text-sm text-gray-600 mb-1">
          {deal.category} • {deal.neighborhood}
        </p>
        <p className="text-sm text-gray-500">{deal.address}</p>
        {expiresOn && (
          <p className="text-sm text-gray-600 mt-2">
            Expires: {expiresOn.toLocaleDateString()}
          </p>
        )}
      </div>
    </Link>
  )
}
