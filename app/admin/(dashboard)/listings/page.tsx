'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { adminApi } from '@/lib/api/admin'
import type { AdminListing } from '@/lib/api/admin'
import {
  Search,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  MapPin,
  Bed,
  Bath,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Image from 'next/image'

export default function ListingsPage() {
  const [listings, setListings] = useState<AdminListing[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
<<<<<<< HEAD
  const [typeFilter, setTypeFilter] = useState<'all' | 'connect' | 'agent'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all')
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
=======
  const [statusFilter, setStatusFilter] = useState<string>('all')
>>>>>>> main
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [deleteModal, setDeleteModal] = useState<string | null>(null)

<<<<<<< HEAD
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
=======
  const PAGE_SIZE = 20

  const load = useCallback(async (p = page, status = statusFilter) => {
    setLoading(true)
    try {
      const data = await adminApi.getListings(p, PAGE_SIZE, status === 'all' ? undefined : status)
      setListings(data.listings ?? [])
      setTotal(data.total ?? 0)
    } catch { /* show empty */ }
    finally { setLoading(false) }
  }, [page, statusFilter])

  useEffect(() => { load(page, statusFilter) }, [page, statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = listings.filter((l) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return l.title.toLowerCase().includes(q) || (l.city ?? l.state ?? '').toLowerCase().includes(q)
  })

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    try {
      await adminApi.approveListing(id)
      setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: 'active' } : l))
    } catch { /* ignore */ }
    finally { setActionLoading(null); setShowActionMenu(null) }
>>>>>>> main
  }

  const handleReject = async () => {
    if (!rejectModal) return
    setActionLoading(rejectModal)
    try {
      await adminApi.rejectListing(rejectModal, rejectReason || 'Does not meet requirements')
      setListings((prev) => prev.map((l) => l.id === rejectModal ? { ...l, status: 'rejected' } : l))
    } catch { /* ignore */ }
    finally { setActionLoading(null); setRejectModal(null); setRejectReason('') }
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    setActionLoading(deleteModal)
    try {
      await adminApi.deleteListing(deleteModal)
      setListings((prev) => prev.filter((l) => l.id !== deleteModal))
      setTotal((prev) => prev - 1)
    } catch { /* ignore */ }
    finally { setActionLoading(null); setDeleteModal(null) }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const activeCount = listings.filter((l) => l.status === 'active').length
  const pendingCount = listings.filter((l) => l.status === 'pending').length

  return (
    <div className="min-h-screen">
      <AdminHeader title="Listings" />

      <div className="p-6 space-y-6">
        {/* Stats */}
<<<<<<< HEAD
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
=======
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Listings', value: total, color: 'text-white' },
            { label: 'Active', value: activeCount, color: 'text-green-400' },
            { label: 'Pending', value: pendingCount, color: 'text-yellow-400' },
            { label: 'This Page', value: filtered.length, color: 'text-blue-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
              <p className="text-sm text-gray-400 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>
                {loading ? <span className="inline-block w-12 h-7 bg-gray-800 rounded animate-pulse" /> : value}
              </p>
            </div>
          ))}
>>>>>>> main
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
              className="w-full pl-10 pr-4 py-2.5 bg-[#12121a] border border-gray-800 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
<<<<<<< HEAD
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
=======
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="px-4 py-2.5 bg-[#12121a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No listings found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800/50">
                      {['Property', 'Location', 'Type', 'Price', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((listing) => (
>>>>>>> main
                      <tr key={listing.id} className="border-b border-gray-800/30 hover:bg-gray-800/20">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-lg bg-gray-800 overflow-hidden shrink-0">
                              {listing.images?.[0] && (
                                <Image src={listing.images[0].url} alt={listing.title} width={56} height={56} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white truncate max-w-[160px]">{listing.title}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                {listing.bedrooms && <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {listing.bedrooms}</span>}
                                {listing.bathrooms && <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {listing.bathrooms}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1 text-sm text-gray-400">
                            <MapPin className="w-3.5 h-3.5" />
                            {listing.city || listing.state || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                            {listing.property_type ?? 'Listing'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-white font-medium">
                          {listing.price ? `₦${Number(listing.price).toLocaleString()}` : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            listing.status === 'active' ? 'text-green-400' :
                            listing.status === 'pending' ? 'text-yellow-400' :
                            listing.status === 'rejected' ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              listing.status === 'active' ? 'bg-green-400' :
                              listing.status === 'pending' ? 'bg-yellow-400' :
                              listing.status === 'rejected' ? 'bg-red-400' : 'bg-gray-400'
                            }`} />
                            {(listing.status ?? 'unknown').charAt(0).toUpperCase() + (listing.status ?? 'unknown').slice(1)}
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
                              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {showActionMenu === listing.id && (
                              <div className="absolute right-0 top-full mt-1 w-40 bg-[#1a1a24] border border-gray-800 rounded-lg shadow-xl z-10 overflow-hidden">
                                <a
                                  href={`/admin/listings/${listing.id}`}
                                  onClick={() => setShowActionMenu(null)}
                                  className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" /> View Details
                                </a>
                                {listing.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApprove(listing.id)}
                                      disabled={actionLoading === listing.id}
                                      className="w-full px-4 py-2.5 text-left text-sm text-green-400 hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
                                    >
                                      <CheckCircle className="w-4 h-4" /> Approve
                                    </button>
                                    <button
                                      onClick={() => { setRejectModal(listing.id); setShowActionMenu(null) }}
                                      className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
                                    >
                                      <XCircle className="w-4 h-4" /> Reject
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => { setDeleteModal(listing.id); setShowActionMenu(null) }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-gray-800 flex items-center gap-2 border-t border-gray-800/50"
                                >
                                  <Trash2 className="w-4 h-4" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-5 py-4 border-t border-gray-800/50 flex items-center justify-between">
                <p className="text-sm text-gray-400">Page {page} of {totalPages || 1} &middot; {total} listings</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:bg-gray-800 disabled:opacity-50">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm font-medium">{page}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:bg-gray-800 disabled:opacity-50">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-white mb-2">Reject Listing</h3>
            <p className="text-gray-400 text-sm mb-4">Provide a reason for rejection (optional).</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason..."
              rows={3}
              className="w-full px-3 py-2.5 bg-[#1a1a24] border border-gray-800 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)} className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl">Cancel</button>
              <button
                onClick={handleReject}
                disabled={!!actionLoading}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white font-medium rounded-xl disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Delete Listing</h3>
            <p className="text-gray-400 text-sm mb-6">This will permanently delete the listing. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)} className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl">Cancel</button>
              <button
                onClick={handleDelete}
                disabled={!!actionLoading}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white font-medium rounded-xl disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
