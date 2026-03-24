'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { useAppStore } from '@/lib/store'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Upload, X, Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function EditListingPage() {
  const params = useParams()
  const router = useRouter()
  const { properties, updateProperty } = useAppStore()
  const [saved, setSaved] = useState(false)
  
  const listing = properties.find(p => p.id === params.id)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: 0,
    beds: 0,
    baths: 0,
    type: 'connect' as 'connect' | 'agent',
    category: '' as string,
  })

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        location: listing.location || '',
        price: listing.price || 0,
        beds: listing.beds || 0,
        baths: listing.baths || 0,
        type: listing.type || 'connect',
        category: listing.category || '',
      })
    }
  }, [listing])

  const handleSave = () => {
    if (listing) {
      updateProperty(listing.id, formData)
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        router.push('/admin/listings')
      }, 1500)
    }
  }

  if (!listing) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Edit Listing" />
        <div className="p-6">
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-12 text-center">
            <p className="text-gray-400">Listing not found</p>
            <Link href="/admin/listings" className="text-purple-400 hover:text-purple-300 mt-2 inline-block">
              Back to listings
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Edit Listing" />
      
      <div className="p-6">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Property Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Price (N)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      <option value="">Select category</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="flat">Flat</option>
                      <option value="duplex">Duplex</option>
                      <option value="studio">Studio</option>
                      <option value="office">Office Space</option>
                      <option value="shop">Shop</option>
                      <option value="land">Land</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bedrooms</label>
                    <input
                      type="number"
                      value={formData.beds}
                      onChange={(e) => setFormData({ ...formData, beds: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bathrooms</label>
                    <input
                      type="number"
                      value={formData.baths}
                      onChange={(e) => setFormData({ ...formData, baths: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'connect' | 'agent' })}
                      className="w-full px-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      <option value="connect">Connect</option>
                      <option value="agent">Agent</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Images</h3>
              <div className="grid grid-cols-3 gap-4">
                {listing.images?.map((img, i) => (
                  <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-gray-800">
                    <Image src={img} alt={`Image ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">Image editing is managed through the main app</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview Card */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden">
              <div className="relative h-40 bg-gray-800">
                {listing.images?.[0] && (
                  <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white truncate">{formData.title || listing.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{formData.location || listing.location}</p>
                <p className="text-lg font-bold text-purple-400 mt-2">N{(formData.price || listing.price)?.toLocaleString()}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-6 space-y-4">
              <button
                onClick={handleSave}
                disabled={saved}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-green-600 text-white font-medium rounded-xl transition-colors"
              >
                {saved ? (
                  <>
                    <Check className="w-5 h-5" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={() => router.push('/admin/listings')}
                className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
