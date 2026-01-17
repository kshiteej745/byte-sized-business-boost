'use client'

import { useState } from 'react'
import Link from 'next/link'
import { parseNaturalLanguageQuery, scoreBusinesses } from '@/lib/recommender'

interface Business {
  id: number
  name: string
  category: string
  neighborhood: string
  address: string
  avgRating: number
  reviewCount: number
}

interface FinderClientProps {
  categories: string[]
  neighborhoods: string[]
}

export default function FinderClient({ categories, neighborhoods }: FinderClientProps) {
  const [mode, setMode] = useState<'wizard' | 'search'>('wizard')
  const [wizardFilters, setWizardFilters] = useState({
    category: '',
    neighborhood: '',
    budget: '' as '' | 'low' | 'medium' | 'high',
    tags: [] as string[],
    dealsOnly: false,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Array<Business & { score: number; reasons: string[] }>>([])
  const [isSearching, setIsSearching] = useState(false)

  const tagOptions = ['family', 'quiet', 'study', 'coffee', 'outdoor', 'affordable']

  const handleWizardSearch = async () => {
    setIsSearching(true)
    try {
      const res = await fetch('/api/finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'wizard',
          filters: wizardFilters,
        }),
      })
      const data = await res.json()
      setResults(data.results || [])
    } catch (error) {
      alert('Failed to search')
    } finally {
      setIsSearching(false)
    }
  }

  const handleNaturalLanguageSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const res = await fetch('/api/finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'search',
          query: searchQuery,
        }),
      })
      const data = await res.json()
      setResults(data.results || [])
    } catch (error) {
      alert('Failed to search')
    } finally {
      setIsSearching(false)
    }
  }

  const toggleTag = (tag: string) => {
    setWizardFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  return (
    <div className="space-y-8">
      {/* Mode selector */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setMode('wizard')}
          className={`px-4 py-2 font-medium ${
            mode === 'wizard'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Wizard
        </button>
        <button
          onClick={() => setMode('search')}
          className={`px-4 py-2 font-medium ${
            mode === 'search'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Natural Language Search
        </button>
      </div>

      {/* Wizard mode */}
      {mode === 'wizard' && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Your Perfect Business</h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={wizardFilters.category}
                onChange={(e) => setWizardFilters({ ...wizardFilters, category: e.target.value })}
                className="input"
              >
                <option value="">Any Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-2">
                Neighborhood
              </label>
              <select
                id="neighborhood"
                value={wizardFilters.neighborhood}
                onChange={(e) => setWizardFilters({ ...wizardFilters, neighborhood: e.target.value })}
                className="input"
              >
                <option value="">Any Neighborhood</option>
                {neighborhoods.map((hood) => (
                  <option key={hood} value={hood}>
                    {hood}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                Budget
              </label>
              <select
                id="budget"
                value={wizardFilters.budget}
                onChange={(e) => setWizardFilters({ ...wizardFilters, budget: e.target.value as any })}
                className="input"
              >
                <option value="">Any Budget</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags / Vibes
              </label>
              <div className="flex flex-wrap gap-2">
                {tagOptions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      wizardFilters.tags.includes(tag)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={wizardFilters.dealsOnly}
                  onChange={(e) => setWizardFilters({ ...wizardFilters, dealsOnly: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Only show businesses with active deals</span>
              </label>
            </div>

            <button
              onClick={handleWizardSearch}
              disabled={isSearching}
              className="btn btn-primary w-full"
            >
              {isSearching ? 'Searching...' : 'Find Businesses'}
            </button>
          </div>
        </div>
      )}

      {/* Natural language search mode */}
      {mode === 'search' && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Natural Language Search</h2>
          <p className="text-gray-600 mb-4">
            Try queries like: &quot;cheap coffee in carytown with deals&quot; or &quot;family friendly restaurant near short pump&quot;
          </p>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNaturalLanguageSearch()}
              placeholder="Enter your search query..."
              className="input flex-1"
            />
            <button
              onClick={handleNaturalLanguageSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="btn btn-primary"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Found {results.length} business{results.length !== 1 ? 'es' : ''}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((business) => (
              <Link
                key={business.id}
                href={`/business/${business.id}`}
                className="card hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <div className="mb-2">
                  <span className="badge badge-primary">Score: {business.score.toFixed(0)}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{business.name}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  {business.category} • {business.neighborhood}
                </p>
                <p className="text-gray-500 text-sm mb-3">{business.address}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-500">★</span>
                  <span className="font-medium">
                    {business.avgRating > 0 ? business.avgRating.toFixed(1) : 'No rating'}
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({business.reviewCount} review{business.reviewCount !== 1 ? 's' : ''})
                  </span>
                </div>
                {business.reasons.length > 0 && (
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Because you said:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {business.reasons.map((reason, i) => (
                        <li key={i}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && mode === 'search' && searchQuery && !isSearching && (
        <div className="card text-center py-12">
          <p className="text-gray-600">No businesses found. Try different keywords.</p>
        </div>
      )}
    </div>
  )
}
