'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface FavoritesClientProps {
  businessId: number
  businessName: string
  category: string
  neighborhood: string
  address: string
  avgRating: number
  reviewCount: number
}

export default function FavoritesClient({
  businessId,
  businessName,
  category,
  neighborhood,
  address,
  avgRating,
  reviewCount,
}: FavoritesClientProps) {
  const router = useRouter()
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = async () => {
    if (!confirm('Remove from favorites?')) return

    setIsRemoving(true)
    try {
      const res = await fetch(`/api/favorites?businessId=${businessId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      alert('Failed to remove favorite')
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <Link
        href={`/business/${businessId}`}
        className="block focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{businessName}</h3>
        <p className="text-gray-600 text-sm mb-2">
          {category} • {neighborhood}
        </p>
        <p className="text-gray-500 text-sm mb-3">{address}</p>
        <div className="flex items-center gap-2">
          <span className="text-yellow-500">★</span>
          <span className="font-medium">
            {avgRating > 0 ? avgRating.toFixed(1) : 'No rating'}
          </span>
          <span className="text-gray-500 text-sm">
            ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
          </span>
        </div>
      </Link>
      <button
        onClick={handleRemove}
        disabled={isRemoving}
        className="btn btn-danger mt-4 w-full"
      >
        {isRemoving ? 'Removing...' : 'Remove from Favorites'}
      </button>
    </div>
  )
}
