import FinderClient from './FinderClient'
import { db } from '@/lib/db'
import { businesses } from '@/lib/schema'

export default async function FinderPage() {
  // Get unique categories and neighborhoods for filters
  const allBusinesses = await db.select().from(businesses)
  const categories = Array.from(new Set(allBusinesses.map(b => b.category))).sort()
  const neighborhoods = Array.from(new Set(allBusinesses.map(b => b.neighborhood))).sort()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Business Finder</h1>
      <p className="text-gray-600 mb-8">
        Find the perfect business for your needs using our wizard or natural language search.
      </p>

      <FinderClient categories={categories} neighborhoods={neighborhoods} />
    </div>
  )
}
