import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { favorites, profiles, businesses, reviews } from '@/lib/schema'
import { eq, sql, and } from 'drizzle-orm'
import Link from 'next/link'
import FavoritesClient from './FavoritesClient'

export default async function FavoritesPage() {
  const cookieStore = cookies()
  const profileIdCookie = cookieStore.get('profile_id')
  
  if (!profileIdCookie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Favorites</h1>
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">You need to create a profile to save favorites.</p>
          <Link href="/help" className="btn btn-primary">
            Learn More
          </Link>
        </div>
      </div>
    )
  }

  const profileId = parseInt(profileIdCookie.value)

  // Get favorites with business data
  const favs = await db.select({
    favoriteId: favorites.id,
    businessId: businesses.id,
    businessName: businesses.name,
    category: businesses.category,
    neighborhood: businesses.neighborhood,
    address: businesses.address,
    avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`.as('avg_rating'),
    reviewCount: sql<number>`COUNT(${reviews.id})`.as('review_count'),
    favoritedAt: favorites.createdAt,
  })
    .from(favorites)
    .innerJoin(businesses, eq(favorites.businessId, businesses.id))
    .leftJoin(reviews, eq(businesses.id, reviews.businessId))
    .where(eq(favorites.profileId, profileId))
    .groupBy(favorites.id, businesses.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Favorites</h1>
      
      {favs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">You haven't saved any favorites yet.</p>
          <Link href="/browse" className="btn btn-primary">
            Browse Businesses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favs.map((fav) => (
            <FavoritesClient
              key={fav.favoriteId}
              businessId={fav.businessId}
              businessName={fav.businessName}
              category={fav.category}
              neighborhood={fav.neighborhood}
              address={fav.address}
              avgRating={Number(fav.avgRating) || 0}
              reviewCount={Number(fav.reviewCount) || 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
