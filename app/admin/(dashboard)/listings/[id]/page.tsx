'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { AdminHeader } from '@/components/admin/header'
import { adminApi } from '@/lib/api/admin'
import type { AdminListing, AdminUser } from '@/lib/api/admin'
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
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Maximize2,
  X,
  User,
  Phone,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type MediaItem =
  | { kind: 'image'; url: string }
  | { kind: 'video'; url: string }

export default function AdminListingDetailPage() {
  const params = useParams()
  const listingId = params.id as string

  const [listing, setListing] = useState<AdminListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null)
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [fullscreen, setFullscreen] = useState(false)
  const [profileModal, setProfileModal] = useState(false)
  const [profileUser, setProfileUser] = useState<AdminUser | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFsPlaying, setIsFsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fsVideoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = (ref: React.RefObject<HTMLVideoElement | null>, setPlaying: (v: boolean) => void) => {
    const v = ref.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) } else { v.pause(); setPlaying(false) }
  }

  const skip = (ref: React.RefObject<HTMLVideoElement | null>, secs: number) => {
    if (ref.current) ref.current.currentTime = Math.max(0, ref.current.currentTime + secs)
  }

  const openFullscreen = () => {
    videoRef.current?.pause()
    setIsPlaying(false)
    setFullscreen(true)
  }

  const closeFullscreen = () => {
    fsVideoRef.current?.pause()
    setIsFsPlaying(false)
    setFullscreen(false)
  }

  // Auto-play fullscreen video once the modal mounts
  useEffect(() => {
    if (fullscreen && current?.kind === 'video') {
      fsVideoRef.current?.play()
        .then(() => setIsFsPlaying(true))
        .catch(() => setIsFsPlaying(false))
    }
  }, [fullscreen])

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

  const handleViewProfile = async () => {
    setProfileModal(true)
    if (profileUser) return
    setProfileLoading(true)
    try {
      const user = await adminApi.getUser(listing!.agent_id)
      setProfileUser(user)
    } catch { /* show fallback */ }
    finally { setProfileLoading(false) }
  }

  // Build unified media list: images first, then video
  const media: MediaItem[] = [
    ...(listing?.images ?? []).map((img) => ({ kind: 'image' as const, url: img.image_url })),
    ...(listing?.video_tour_url ? [{ kind: 'video' as const, url: listing.video_tour_url }] : []),
  ]

  const current = media[currentIndex]
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
          <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <AdminHeader title="Listing Details" />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Back */}
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </button>

        {/* Media carousel */}
        {media.length > 0 ? (
          <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-gray-900">
            {current.kind === 'image' ? (
              <Image src={current.url} alt={listing.title} fill className="object-cover" unoptimized />
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={current.url}
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />
                {/* Custom video controls */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-5">
                  <button
                    onClick={() => skip(videoRef, -10)}
                    className="flex flex-col items-center gap-0.5 text-white/90 hover:text-white"
                  >
                    <RotateCcw className="w-6 h-6" />
                    <span className="text-[10px] font-semibold leading-none">10</span>
                  </button>
                  <button
                    onClick={() => togglePlay(videoRef, setIsPlaying)}
                    className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-sm"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </button>
                  <button
                    onClick={() => skip(videoRef, 10)}
                    className="flex flex-col items-center gap-0.5 text-white/90 hover:text-white"
                  >
                    <RotateCw className="w-6 h-6" />
                    <span className="text-[10px] font-semibold leading-none">10</span>
                  </button>
                </div>
              </>
            )}

            {/* Fullscreen button */}
            <button
              onClick={openFullscreen}
              className="absolute top-3 right-3 w-9 h-9 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {media.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 rounded-full flex items-center justify-center text-white disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentIndex((i) => Math.min(media.length - 1, i + 1))}
                  disabled={currentIndex === media.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 rounded-full flex items-center justify-center text-white disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Thumbnail strip */}
            {media.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 pt-8 pb-3 px-3">
                <div className="flex gap-2 overflow-x-auto">
                  {media.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`relative w-14 h-10 rounded shrink-0 overflow-hidden border-2 ${i === currentIndex ? 'border-purple-400' : 'border-transparent'}`}
                    >
                      {item.kind === 'image' ? (
                        <Image src={item.url} alt="" fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                      )}
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

          <div className="flex items-end gap-6 flex-wrap">
            {listing.price && (
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Rent</p>
                <p className="text-2xl font-bold text-white">
                  ₦{Number(listing.price).toLocaleString()}
                  {listing.rent_period && <span className="text-sm text-gray-400 font-normal ml-1">/ {listing.rent_period}</span>}
                </p>
              </div>
            )}
            {listing.total_package && (
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Total Package</p>
                <p className="text-xl font-bold text-purple-400">₦{Number(listing.total_package).toLocaleString()}</p>
              </div>
            )}
          </div>
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
          <h3 className="font-semibold text-white mb-3">Posted By</h3>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                <User className="w-5 h-5" />
              </div>
              <p className="text-sm text-gray-400 font-mono">{listing.agent_id}</p>
            </div>
            <button
              onClick={handleViewProfile}
              className="text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 hover:border-purple-400/50 px-3 py-1.5 rounded-lg transition-colors"
            >
              View Profile
            </button>
          </div>
        </div>

        {/* Action buttons */}
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

      {/* Fullscreen media modal */}
      {fullscreen && current && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {media.length > 1 && (
            <>
              <button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white disabled:opacity-30 z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setCurrentIndex((i) => Math.min(media.length - 1, i + 1))}
                disabled={currentIndex === media.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white disabled:opacity-30 z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="w-full h-full flex items-center justify-center p-4">
            {current.kind === 'image' ? (
              <img src={current.url} alt="" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={fsVideoRef}
                  src={current.url}
                  className="max-w-full max-h-full"
                  onPlay={() => setIsFsPlaying(true)}
                  onPause={() => setIsFsPlaying(false)}
                  onEnded={() => setIsFsPlaying(false)}
                />
                {/* Custom fullscreen video controls */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-6 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-2xl">
                  <button
                    onClick={() => skip(fsVideoRef, -10)}
                    className="flex flex-col items-center gap-0.5 text-white/90 hover:text-white"
                  >
                    <RotateCcw className="w-7 h-7" />
                    <span className="text-[10px] font-semibold leading-none">10</span>
                  </button>
                  <button
                    onClick={() => togglePlay(fsVideoRef, setIsFsPlaying)}
                    className="w-14 h-14 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
                  >
                    {isFsPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                  </button>
                  <button
                    onClick={() => skip(fsVideoRef, 10)}
                    className="flex flex-col items-center gap-0.5 text-white/90 hover:text-white"
                  >
                    <RotateCw className="w-7 h-7" />
                    <span className="text-[10px] font-semibold leading-none">10</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Counter — only for images in fullscreen */}
          {current.kind === 'image' && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-4 py-1.5 rounded-full">
              {currentIndex + 1} / {media.length}
            </div>
          )}
        </div>
      )}

      {/* User profile modal */}
      {profileModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">User Profile</h3>
              <button onClick={() => setProfileModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {profileLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
            ) : profileUser ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
                    {(profileUser.first_name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">{profileUser.first_name} {profileUser.last_name}</p>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                      profileUser.role === 'agent' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {(profileUser.role || '').charAt(0).toUpperCase() + profileUser.role.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-gray-300 break-all">{profileUser.email}</span>
                  </div>
                  {profileUser.phone_number && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="text-gray-300">{profileUser.phone_number}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-gray-300">Joined {new Date(profileUser.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Could not load user details</p>
                <p className="text-gray-600 text-xs mt-1 font-mono">{listing.agent_id}</p>
              </div>
            )}
          </div>
        </div>
      )}

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
