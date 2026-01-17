'use client'

import { useState } from 'react'

interface ReportsClientProps {
  categories: string[]
  neighborhoods: string[]
}

function toCSV(rows: Record<string, any>[], headers: string[]) {
    const esc = (v: any) => {
      const s = v === null || v === undefined ? '' : String(v)
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
      return s
    }
  
    const lines: string[] = []
    lines.push(headers.map(esc).join(','))
    for (const row of rows) {
      lines.push(headers.map(h => esc(row[h])).join(','))
    }
    return lines.join('\n')
  }

type ReportType = 'top-rated' | 'most-reviewed' | 'category-dist' | 'expiring-deals' | 'most-favorited' | null

export default function ReportsClient({ categories, neighborhoods }: ReportsClientProps) {
  const [reportType, setReportType] = useState<ReportType>(null)
  const [filters, setFilters] = useState({
    category: '',
    neighborhood: '',
    minReviews: 0,
    activeDealsOnly: false,
    expiryWindow: 7,
  })
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!reportType) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          filters,
        }),
      })
      const data = await res.json()
      setResults(data.results || [])
    } catch (error) {
      alert('Failed to generate report')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (results.length === 0) return

    let headers: string[] = []
    let csvData: any[] = []

    switch (reportType) {
      case 'top-rated':
      case 'most-reviewed':
        headers = ['Name', 'Category', 'Neighborhood', 'Average Rating', 'Review Count']
        csvData = results.map(r => ({
          'Name': r.name,
          'Category': r.category,
          'Neighborhood': r.neighborhood,
          'Average Rating': r.avgRating.toFixed(1),
          'Review Count': r.reviewCount,
        }))
        break
      case 'category-dist':
        headers = ['Category', 'Count']
        csvData = results.map(r => ({
          'Category': r.category,
          'Count': r.count,
        }))
        break
      case 'expiring-deals':
        headers = ['Deal Title', 'Business', 'Category', 'Coupon Code', 'Expires On']
        csvData = results.map(r => ({
          'Deal Title': r.dealTitle,
          'Business': r.businessName,
          'Category': r.category,
          'Coupon Code': r.couponCode || '',
          'Expires On': r.expiresOn ? new Date(r.expiresOn).toLocaleDateString() : '',
        }))
        break
      case 'most-favorited':
        headers = ['Name', 'Category', 'Neighborhood', 'Favorite Count']
        csvData = results.map(r => ({
          'Name': r.name,
          'Category': r.category,
          'Neighborhood': r.neighborhood,
          'Favorite Count': r.favoriteCount,
        }))
        break
    }

    const csv = toCSV(csvData, headers)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${reportType}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Report Options</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report Type *
          </label>
          <select
            value={reportType || ''}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="input"
          >
            <option value="">Select report type...</option>
            <option value="top-rated">Top Businesses by Rating</option>
            <option value="most-reviewed">Most Reviewed Businesses</option>
            <option value="category-dist">Category Distribution</option>
            <option value="expiring-deals">Deals Expiring Soon</option>
            <option value="most-favorited">Most Favorited Businesses</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category Filter
            </label>
            <select
              id="category"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
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
              Neighborhood Filter
            </label>
            <select
              id="neighborhood"
              value={filters.neighborhood}
              onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value })}
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

          {(reportType === 'top-rated' || reportType === 'most-reviewed') && (
            <div>
              <label htmlFor="minReviews" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Reviews
              </label>
              <input
                id="minReviews"
                type="number"
                min="0"
                value={filters.minReviews}
                onChange={(e) => setFilters({ ...filters, minReviews: parseInt(e.target.value) || 0 })}
                className="input"
              />
            </div>
          )}

          {reportType === 'expiring-deals' && (
            <div>
              <label htmlFor="expiryWindow" className="block text-sm font-medium text-gray-700 mb-1">
                Days Ahead
              </label>
              <select
                id="expiryWindow"
                value={filters.expiryWindow}
                onChange={(e) => setFilters({ ...filters, expiryWindow: parseInt(e.target.value) })}
                className="input"
              >
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
              </select>
            </div>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={!reportType || isLoading}
          className="btn btn-primary"
        >
          {isLoading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Results</h2>
            <button onClick={handleExportCSV} className="btn btn-secondary">
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(results[0]).map((key) => (
                    <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((value: any, j) => (
                      <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {value !== null && value !== undefined ? String(value) : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
