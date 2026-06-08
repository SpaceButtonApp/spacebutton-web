'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AdminHeader } from '@/components/admin/header'
import { adminApi } from '@/lib/api/admin'
import type { AdminListing } from '@/lib/api/admin'
import {
  ArrowLeft,
  Bed,
  Bath,
  MapPin,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const listingId = params.id as string

  const [listing, setListing] = useState<AdminListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null)
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    adminApi.getListing(listingId)
      .then(setListing)
      .catch(() => setListing(null))
      .finally(() => setLoading(false))
  }, [listingId])

  const handleApprove = async () => {
    setActionLoading('approve')
    try {
      await adminApi.approveListing(listingId)
      setListing((prev) => prev ? { ...prev, status: 'active' } : prev)
    } catch { /* ignore */ }
    finally { setActionLoading(null) }
  }

  const handleReject = async () => {
    setActionLoading('reject')
    try {
      await adminApi.rejectListing(listingId, rejectReason || 'Does not meet requirements')
      setListing((prev) => prev ? { ...prev, status: 'rejected' } : prev)
    } catch { /* ignore */ }
    finally { setActionLoading(null); setRejectModal(false); setRejectReason('') }
  }

  const images = listing?.images ?? []
  const status = (listing?.status || '').toLowerCase()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <AdminHeader title="Listing Details" />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <AdminHeader title="Listing Details" />
        <div className="flex items-center justify-center h-64 flex-col gap-4">
          <Building2 className="w-12 h-12 text-gray-700" />
          <p className="text-gray-400">Listing not found</p>
          <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <AdminHeader title="Listing Details" />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </button>

        {/* Images */}
        {images.length > 0 ? (
          <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-gray-800">
            <Image src={images[currentImageIndex].url} alt={listing.title} fill className="object-cover" />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((i) => Math.max(0, i - 1))}
                  disabled={currentImageIndex === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 rounded-full flex items-center justify-center text-white disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((i) => Math.min(images.length - 1, i + 1))}
                  disabled={currentImageIndex === images.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 rounded-full flex items-center justify-center text-white disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-white' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </>
            )}
            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 pt-8 pb-3 px-3">
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setCurrentImageIndex(i)} className={`relative w-14 h-10 rounded shrink-0 overflow-hidden border-2 ${i === currentImageIndex ? 'border-purple-400' : 'border-transparent'}`}>
                      <Image src={img.url} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-800 rounded-2xl flex items-center justify-center">
            <Building2 className="w-12 h-12 text-gray-600" />
          </div>
        )}

        {/* Header */}
        <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-xl font-bold text-white">{listing.title}</h1>
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full shrink-0 ${
              status === 'active' ? 'bg-green-500/20 text-green-400' :
              status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
              status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                status === 'active' ? 'bg-green-400' : status === 'pending' ? 'bg-yellow-400' : status === 'rejected' ? 'bg-red-400' : 'bg-gray-400'
              }`} />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
            {(listing.city || listing.state) && (
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{[listing.city, listing.state].filter(Boolean).join(', ')}</span>
            )}
            {listing.address && <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" />{listing.address}</span>}
            {listing.bedrooms != null && <span className="flex items-center gap-1.5"><Bed className="w-4 h-4" />{listing.bedrooms} bed{listing.bedrooms !== 1 ? 's' : ''}</span>}
            {listing.bathrooms != null && <span className="flex items-center gap-1.5"><Bath className="w-4 h-4" />{listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}</span>}
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />Posted {new Date(listing.created_at).toLocaleDateString()}</span>
          </div>

          {listing.price && (
            <p className="text-2xl font-bold text-white">
              ₦{Number(listing.price).toLocaleString()}
            </p>
          )}
        </div>

        {/* Description */}
        {listing.description && (
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-2">Description</h3>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>
        )}

        {/* Agent info */}
        <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-2">Posted By</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">A</div>
            <div>
              <p className="text-sm text-white font-mono">{listing.agent_id}</p>
              <a href={`/user/${listing.agent_id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:underline">View profile →</a>
            </div>
          </div>
        </div>

        {/* Action buttons — only show for pending listings */}
        {status === 'pending' && (
          <div className="bg-[#12121a] border border-yellow-500/30 rounded-xl p-5">
            <p className="text-yellow-400 font-medium mb-4">This listing is awaiting your review.</p>
            <div className="flex gap-3">
              <Button
                onClick={handleApprove}
                disabled={!!actionLoading}
                className="flex-1 h-11 bg-green-500 hover:bg-green-400 text-white font-semibold"
              >
                {actionLoading === 'approve' ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-2" />Approve Listing</>}
              </Button>
              <Button
                onClick={() => setRejectModal(true)}
                disabled={!!actionLoading}
                variant="outline"
                className="flex-1 h-11 border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <XCircle className="w-4 h-4 mr-2" />Reject Listing
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-white mb-1">Reject Listing</h3>
            <p className="text-gray-400 text-sm mb-4">Provide a reason so the agent knows what to fix.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Images are unclear, price is unrealistic..."
              rows={3}
              className="w-full px-3 py-2.5 bg-[#1a1a24] border border-gray-800 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(false)} className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl">Cancel</button>
              <button
                onClick={handleReject}
                disabled={!!actionLoading}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white font-medium rounded-xl disabled:opacity-50"
              >
                {actionLoading === 'reject' ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
