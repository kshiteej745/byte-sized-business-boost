'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Review {
  id: number
  rating: number
  title: string
  body: string
  displayName: string
  createdAt: Date
}

interface BusinessDetailClientProps {
  businessId: number
  reviews: Review[]
  currentSort: string
  profileId: string | null
}

export default function BusinessDetailClient({
  businessId,
  reviews,
  currentSort,
  profileId,
}: BusinessDetailClientProps) {
  const router = useRouter()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showMathChallenge, setShowMathChallenge] = useState(false)
  const [mathChallenge, setMathChallenge] = useState<{ challenge: string; token: string } | null>(null)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    body: '',
    displayName: '',
    mathAnswer: '',
    honeypot: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSortChange = (sort: string) => {
    router.push(`/business/${businessId}?sort=${sort}`)
  }

  const loadMathChallenge = async () => {
    const res = await fetch('/api/math-challenge')
    const data = await res.json()
    setMathChallenge(data)
    setShowMathChallenge(true)
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Honeypot check (client-side)
    if (reviewForm.honeypot) {
      setError('Invalid submission')
      return
    }

    if (!mathChallenge) {
      await loadMathChallenge()
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          rating: reviewForm.rating,
          title: reviewForm.title,
          body: reviewForm.body,
          displayName: reviewForm.displayName,
          mathAnswer: parseInt(reviewForm.mathAnswer),
          mathToken: mathChallenge.token,
          honeypot: reviewForm.honeypot,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to submit review')
        return
      }

      router.refresh()
      setShowReviewForm(false)
      setReviewForm({
        rating: 5,
        title: '',
        body: '',
        displayName: '',
        mathAnswer: '',
        honeypot: '',
      })
      setMathChallenge(null)
      setShowMathChallenge(false)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => handleSortChange('newest')}
            className={`px-3 py-1 rounded ${currentSort === 'newest' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Newest
          </button>
          <button
            onClick={() => handleSortChange('highest')}
            className={`px-3 py-1 rounded ${currentSort === 'highest' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Highest
          </button>
          <button
            onClick={() => handleSortChange('lowest')}
            className={`px-3 py-1 rounded ${currentSort === 'lowest' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Lowest
          </button>
        </div>

        <button
          onClick={() => {
            setShowReviewForm(true)
            loadMathChallenge()
          }}
          className="btn btn-primary"
        >
          Write Review
        </button>
      </div>

      {showReviewForm && (
        <div className="border border-gray-300 rounded-lg p-6 mb-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
          <form onSubmit={handleReviewSubmit}>
            <div className="mb-4">
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Display Name *
              </label>
              <input
                id="displayName"
                type="text"
                value={reviewForm.displayName}
                onChange={(e) => setReviewForm({ ...reviewForm, displayName: e.target.value })}
                required
                className="input"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                Rating *
              </label>
              <select
                id="rating"
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                required
                className="input"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} ★
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                required
                maxLength={200}
                className="input"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
                Review *
              </label>
              <textarea
                id="body"
                value={reviewForm.body}
                onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                required
                maxLength={2000}
                rows={4}
                className="input"
              />
            </div>

            {showMathChallenge && mathChallenge && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <label htmlFor="mathAnswer" className="block text-sm font-medium text-gray-700 mb-1">
                  Math Challenge: {mathChallenge.challenge} = ?
                </label>
                <input
                  id="mathAnswer"
                  type="number"
                  value={reviewForm.mathAnswer}
                  onChange={(e) => setReviewForm({ ...reviewForm, mathAnswer: e.target.value })}
                  required
                  className="input"
                />
              </div>
            )}

            {/* Honeypot field - hidden from users */}
            <input
              type="text"
              name="website"
              value={reviewForm.honeypot}
              onChange={(e) => setReviewForm({ ...reviewForm, honeypot: e.target.value })}
              style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
              tabIndex={-1}
              aria-hidden="true"
            />

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false)
                  setMathChallenge(null)
                  setShowMathChallenge(false)
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No reviews yet. Be the first to review this business!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{review.title}</h4>
                  <p className="text-sm text-gray-600">
                    by {review.displayName} • {review.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="text-yellow-500">{'★'.repeat(review.rating)}</div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{review.body}</p>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
