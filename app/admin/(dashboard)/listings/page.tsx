'use client'

import { useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { useAppStore } from '@/lib/store'
import { 
  Search, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  XCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Bed,
  Bath,
  Plus
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function ListingsPage() {
  const router = useRouter()
  const { properties, closedProperties, closeProperty, deleteProperty } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'connect' | 'agent'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all')
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

  const filteredListings = properties.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || listing.type === typeFilter
    const isClosed = closedProperties.includes(listing.id)
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && !isClosed) ||
                         (statusFilter === 'closed' && isClosed)
    const matchesApproval = approvalFilter === 'all' || 
                           listing.approvalStatus === approvalFilter
    return matchesSearch && matchesType && matchesStatus && matchesApproval
  })

  const activeCount = properties.filter(p => !closedProperties.includes(p.id)).length
  const closedCount = closedProperties.length
  const pendingApprovalCount = properties.filter(p => p.approvalStatus === 'pending').length
  const approvedCount = properties.filter(p => p.approvalStatus === 'approved').length
  const rejectedCount = properties.filter(p => p.approvalStatus === 'rejected').length

  const handleCloseListing = (id: string) => {
    closeProperty(id)
    setShowActionMenu(null)
  }

  const handleViewListing = (id: string) => {
    // Navigate to admin property details page
    router.push(`/admin/listings/${id}`)
    setShowActionMenu(null)
  }

  const handleEditListing = (id: string) => {
    // Navigate to edit post page
    router.push(`/admin/listings/edit/${id}`)
    setShowActionMenu(null)
  }

  const handleDeleteListing = (id: string) => {
    deleteProperty(id)
    setShowDeleteModal(null)
    setShowActionMenu(null)
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Listings" />
      
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Total Listings</p>
            <p className="text-2xl font-bold text-white">{properties.length}</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-400">{activeCount}</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Closed</p>
            <p className="text-2xl font-bold text-gray-400">{closedCount}</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Pending Approval</p>
            <p className="text-2xl font-bold text-yellow-400">{pendingApprovalCount}</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Connect Listings</p>
            <p className="text-2xl font-bold text-purple-400">{properties.filter(p => p.type === 'connect').length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#12121a] border border-gray-800 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-4 py-2.5 bg-[#12121a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="all">All Types</option>
              <option value="connect">Connect</option>
              <option value="agent">Agent</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2.5 bg-[#12121a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value as any)}
              className="px-4 py-2.5 bg-[#12121a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="all">All Approval</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="flex bg-[#12121a] border border-gray-800 rounded-xl overflow-hidden">
              <button 
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm ${viewMode === 'table' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Table
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Grid
              </button>
            </div>
            <button 
              onClick={() => router.push('/admin/listings/add')}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 border border-purple-500 rounded-xl text-sm text-white transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Post
            </button>
          </div>
        </div>

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800/50">
                    <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">Property</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">Posted By</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">Location</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">Type</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">Price</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">Status</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">Approval</th>
                    <th className="text-right text-xs font-medium text-gray-400 uppercase px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.map((listing) => {
                    const isClosed = closedProperties.includes(listing.id)
                    return (
                      <tr key={listing.id} className="border-b border-gray-800/30 hover:bg-gray-800/20">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-lg bg-gray-800 overflow-hidden shrink-0">
                              {listing.images?.[0] && (
                                <Image 
                                  src={listing.images[0]} 
                                  alt={listing.title} 
                                  width={56} 
                                  height={56}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{listing.title}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                {listing.beds && <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {listing.beds}</span>}
                                {listing.baths && <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {listing.baths}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {listing.agent?.avatar && (
                              <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden shrink-0">
                                <Image 
                                  src={listing.agent.avatar} 
                                  alt={listing.agent.name || 'User'} 
                                  width={32} 
                                  height={32}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-white">{listing.agent?.name || 'Unknown'}</p>
                              <span className={`text-xs ${
                                listing.agent?.type === 'agent' 
                                  ? 'text-blue-400' 
                                  : listing.agent?.type === 'admin'
                                  ? 'text-purple-400'
                                  : 'text-green-400'
                              }`}>
                                {listing.agent?.type === 'admin' ? 'Admin' : listing.agent?.type === 'agent' ? 'Agent' : 'Individual'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1 text-sm text-gray-400">
                            <MapPin className="w-4 h-4" />
                            {listing.location}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            listing.type === 'connect' 
                              ? 'bg-purple-500/20 text-purple-400' 
                              : listing.type === 'properties'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {listing.type === 'connect' ? 'Connect' : listing.type === 'properties' ? 'Property' : 'Agent'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-white font-medium">
                          N{listing.price?.toLocaleString() || '0'}{listing.rentPeriod ? `/${listing.rentPeriod === 'monthly' ? 'mo' : 'yr'}` : ''}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            isClosed ? 'text-gray-400' : 'text-green-400'
                          }`}>
                            {isClosed ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            {isClosed ? 'Closed' : 'Active'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            listing.approvalStatus === 'pending' 
                              ? 'bg-yellow-500/20 text-yellow-400' 
                              : listing.approvalStatus === 'approved'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {listing.approvalStatus ? listing.approvalStatus.charAt(0).toUpperCase() + listing.approvalStatus.slice(1) : 'Approved'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="relative inline-block">
                            <button 
                              onClick={() => setShowActionMenu(showActionMenu === listing.id ? null : listing.id)}
                              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {showActionMenu === listing.id && (
                              <div className="absolute right-0 top-full mt-1 w-40 bg-[#1a1a24] border border-gray-800 rounded-lg shadow-xl z-10 overflow-hidden">
                                <button 
                                  onClick={() => handleViewListing(listing.id)}
                                  className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" /> View
                                </button>
                                <button 
                                  onClick={() => handleEditListing(listing.id)}
                                  className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" /> Edit
                                </button>
                                {!isClosed && (
                                  <button 
                                    onClick={() => handleCloseListing(listing.id)}
                                    className="w-full px-4 py-2.5 text-left text-sm text-yellow-400 hover:bg-gray-800 flex items-center gap-2"
                                  >
                                    <XCircle className="w-4 h-4" /> Close
                                  </button>
                                )}
                                <button 
                                  onClick={() => setShowDeleteModal(listing.id)}
                                  className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-4 border-t border-gray-800/50 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Showing {filteredListings.length} listings
              </p>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors disabled:opacity-50" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm font-medium">1</button>
                <button className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((listing) => {
              const isClosed = closedProperties.includes(listing.id)
              return (
                <div key={listing.id} className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
                  <div className="relative h-40 bg-gray-800">
                    {listing.images?.[0] && (
                      <Image 
                        src={listing.images[0]} 
                        alt={listing.title} 
                        fill
                        className="object-cover"
                      />
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        listing.type === 'connect' 
                          ? 'bg-purple-500/90 text-white' 
                          : 'bg-blue-500/90 text-white'
                      }`}>
                        {listing.type === 'connect' ? 'Connect' : 'Agent'}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        isClosed ? 'bg-gray-900/90 text-gray-400' : 'bg-green-500/90 text-white'
                      }`}>
                        {isClosed ? 'Closed' : 'Active'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-1 truncate">{listing.title}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1 mb-3">
                      <MapPin className="w-4 h-4" /> {listing.location}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-white">N{listing.price?.toLocaleString()}{listing.rentPeriod ? `/${listing.rentPeriod === 'monthly' ? 'mo' : 'yr'}` : ''}</p>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewListing(listing.id)}
                          className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                          title="View listing"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditListing(listing.id)}
                          className="p-2 rounded-lg bg-gray-800 text-blue-400 hover:bg-blue-500/20 transition-colors"
                          title="Edit listing"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setShowDeleteModal(listing.id)}
                          className="p-2 rounded-lg bg-gray-800 text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Delete listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white text-center mb-2">Delete Listing?</h3>
            <p className="text-gray-400 text-sm text-center mb-6">
              This action cannot be undone. The listing will be permanently removed from the platform.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteListing(showDeleteModal)}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white font-medium rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
