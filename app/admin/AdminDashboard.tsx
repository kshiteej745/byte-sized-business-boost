'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Business {
  id: number
  name: string
  category: string
  neighborhood: string
  address: string
  phone?: string | null
  website?: string | null
  description?: string | null
  tagsCsv?: string | null
}

interface AdminDashboardProps {
  initialBusinesses: Business[]
}

export default function AdminDashboard({ initialBusinesses }: AdminDashboardProps) {
  const router = useRouter()
  const [businesses, setBusinesses] = useState(initialBusinesses)
  const [showBusinessForm, setShowBusinessForm] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    neighborhood: '',
    address: '',
    phone: '',
    website: '',
    description: '',
    tagsCsv: '',
  })
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'businesses' | 'deals' | 'reviews' | 'import'>('businesses')

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const url = editingBusiness
        ? `/api/admin/businesses/${editingBusiness.id}`
        : '/api/admin/businesses'
      
      const method = editingBusiness ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to save business')
        return
      }

      router.refresh()
      setShowBusinessForm(false)
      setEditingBusiness(null)
      setFormData({
        name: '',
        category: '',
        neighborhood: '',
        address: '',
        phone: '',
        website: '',
        description: '',
        tagsCsv: '',
      })
    } catch (err) {
      setError('An error occurred. Please try again.')
    }
  }

  const handleEdit = (business: Business) => {
    setEditingBusiness(business)
    setFormData({
      name: business.name,
      category: business.category,
      neighborhood: business.neighborhood,
      address: business.address,
      phone: business.phone || '',
      website: business.website || '',
      description: business.description || '',
      tagsCsv: business.tagsCsv || '',
    })
    setShowBusinessForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this business? This will also delete all associated reviews, deals, and favorites.')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/businesses/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        alert('Failed to delete business')
        return
      }

      router.refresh()
    } catch (err) {
      alert('An error occurred')
    }
  }

  const handleResetDemoData = async () => {
    if (!confirm('Are you sure? This will delete all businesses, reviews, deals, and favorites. This action cannot be undone.')) {
      return
    }

    if (!confirm('This is your final warning. All data will be permanently deleted.')) {
      return
    }

    try {
      const res = await fetch('/api/admin/reset-demo', { method: 'POST' })
      if (res.ok) {
        alert('Demo data reset. Please run npm run db:seed to reload sample data.')
        router.refresh()
      } else {
        alert('Failed to reset demo data')
      }
    } catch (err) {
      alert('An error occurred')
    }
  }

  const handleExport = async (type: 'businesses' | 'reviews' | 'deals') => {
    try {
      const res = await fetch(`/api/admin/export/${type}`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to export')
    }
  }

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        alert('Failed to import CSV')
        return
      }

      alert('CSV imported successfully')
      router.refresh()
    } catch (err) {
      alert('An error occurred')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('businesses')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'businesses'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Businesses
        </button>
        <button
          onClick={() => setActiveTab('deals')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'deals'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Deals
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'reviews'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Reviews
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'import'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Import/Export
        </button>
      </div>

      {activeTab === 'businesses' && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Manage Businesses</h2>
            <button
              onClick={() => {
                setShowBusinessForm(true)
                setEditingBusiness(null)
                setFormData({
                  name: '',
                  category: '',
                  neighborhood: '',
                  address: '',
                  phone: '',
                  website: '',
                  description: '',
                  tagsCsv: '',
                })
              }}
              className="btn btn-primary"
            >
              Add Business
            </button>
          </div>

          {showBusinessForm && (
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">
                {editingBusiness ? 'Edit Business' : 'Add New Business'}
              </h3>
              <form onSubmit={handleBusinessSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="input"
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <input
                      id="category"
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="input"
                    />
                  </div>
                  <div>
                    <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
                      Neighborhood *
                    </label>
                    <input
                      id="neighborhood"
                      type="text"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      required
                      className="input"
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      className="input"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="tagsCsv" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    id="tagsCsv"
                    type="text"
                    value={formData.tagsCsv}
                    onChange={(e) => setFormData({ ...formData, tagsCsv: e.target.value })}
                    placeholder="coffee, wifi, outdoor"
                    className="input"
                  />
                </div>
                {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded">
                    {error}
                  </div>
                )}
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    {editingBusiness ? 'Update Business' : 'Add Business'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBusinessForm(false)
                      setEditingBusiness(null)
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Neighborhood</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {businesses.map((business) => (
                  <tr key={business.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link href={`/business/${business.id}`} className="text-primary-600 hover:text-primary-700">
                        {business.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{business.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{business.neighborhood}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(business)}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(business.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'import' && (
        <div className="card space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Export Data</h2>
            <div className="flex gap-4">
              <button onClick={() => handleExport('businesses')} className="btn btn-secondary">
                Export Businesses CSV
              </button>
              <button onClick={() => handleExport('reviews')} className="btn btn-secondary">
                Export Reviews CSV
              </button>
              <button onClick={() => handleExport('deals')} className="btn btn-secondary">
                Export Deals CSV
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Import Businesses CSV</h2>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="input"
            />
            <p className="text-sm text-gray-600 mt-2">
              CSV format: name, category, neighborhood, address, phone, website, description, tags_csv
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-2xl font-bold text-red-900 mb-4">Danger Zone</h2>
            <button
              onClick={handleResetDemoData}
              className="btn btn-danger"
            >
              Reset Demo Data
            </button>
            <p className="text-sm text-gray-600 mt-2">
              This will delete all data. Use &quot;npm run db:seed&quot; to reload sample data.
            </p>
          </div>
        </div>
      )}

      {(activeTab === 'deals' || activeTab === 'reviews') && (
        <div className="card">
          <p className="text-gray-600">
            {activeTab === 'deals' ? 'Deals management' : 'Review moderation'} features coming soon.
            For now, you can manage businesses and access data via import/export.
          </p>
        </div>
      )}
    </div>
  )
}
