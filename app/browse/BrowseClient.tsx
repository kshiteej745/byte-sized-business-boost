'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Business {
  id: number
  name: string
  category: string
  neighborhood: string
  address: string
  avgRating: number
  reviewCount: number
}

interface BrowseClientProps {
  businesses: Business[]
  categories: string[]
  neighborhoods: string[]
  currentCategory: string
  currentNeighborhood: string
  currentSort: string
  currentSearch: string
}

export default function BrowseClient({
  businesses,
  categories,
  neighborhoods,
  currentCategory,
  currentNeighborhood,
  currentSort,
  currentSearch,
}: BrowseClientProps) {
  const router = useRouter()
  const [category, setCategory] = useState(currentCategory)
  const [neighborhood, setNeighborhood] = useState(currentNeighborhood)
  const [sort, setSort] = useState(currentSort)
  const [search, setSearch] = useState(currentSearch)

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (neighborhood) params.set('neighborhood', neighborhood)
    if (sort) params.set('sort', sort)
    if (search) params.set('search', search)
    router.push(`/browse?${params.toString()}`)
  }

  return (
    <>
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
              Neighborhood
            </label>
            <select
              id="neighborhood"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="input"
            >
              <option value="">All Neighborhoods</option>
              {neighborhoods.map((hood) => (
                <option key={hood} value={hood}>
                  {hood}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input"
            >
              <option value="name">Name</option>
              <option value="rating">Highest Rating</option>
              <option value="reviews">Most Reviews</option>
            </select>
          </div>

          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              id="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              placeholder="Search businesses..."
              className="input"
            />
          </div>
        </div>

        <button onClick={handleFilter} className="btn btn-primary mt-4">
          Apply Filters
        </button>
      </div>

      {businesses.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">No businesses found matching your criteria.</p>
          <Link href="/browse" className="btn btn-secondary">
            Clear Filters
          </Link>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-4">
            Found {businesses.length} business{businesses.length !== 1 ? 'es' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Link
                key={business.id}
                href={`/business/${business.id}`}
                className="card hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{business.name}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  {business.category} • {business.neighborhood}
                </p>
                <p className="text-gray-500 text-sm mb-3">{business.address}</p>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">★</span>
                  <span className="font-medium">
                    {business.avgRating > 0 ? business.avgRating.toFixed(1) : 'No rating'}
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({business.reviewCount} review{business.reviewCount !== 1 ? 's' : ''})
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  )
}
