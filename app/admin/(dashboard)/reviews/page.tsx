'use client'

import { useState } from 'react'
import { AdminHeader } from '@/components/admin-v2/header'
import { useAppStore } from '@/lib/store'
import { 
  Search, 
  Star, 
  MoreVertical, 
  Flag, 
  Trash2, 
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function ReviewsPage() {
  const { reviews } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all')
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)

  // Mock reviews for display (combine with real reviews)
  const mockReviews = [
    { id: 'm1', fromUserName: 'John Doe', toUserName: 'Agent Mike', rating: 5, feedback: 'Great experience! Very professional and helpful throughout the process.', createdAt: '2024-05-18T10:30:00Z' },
    { id: 'm2', fromUserName: 'Jane Smith', toUserName: 'Sarah Williams', rating: 4, feedback: 'Good communication, property was as described. Would recommend.', createdAt: '2024-05-17T14:20:00Z' },
    { id: 'm3', fromUserName: 'Mike Johnson', toUserName: 'David Brown', rating: 3, feedback: 'Average experience. Response time could be better.', createdAt: '2024-05-16T09:15:00Z' },
    { id: 'm4', fromUserName: 'Emily Davis', toUserName: 'Chris Wilson', rating: 5, feedback: 'Excellent service! Found my dream apartment thanks to this agent.', createdAt: '2024-05-15T16:45:00Z' },
    { id: 'm5', fromUserName: 'Lisa Anderson', toUserName: 'Agent Mike', rating: 2, feedback: 'Property didnt match the photos. Disappointed with the experience.', createdAt: '2024-05-14T11:00:00Z' },
  ]

  const allReviews = [
    ...reviews.map(r => ({ ...r, toUserName: 'User' })),
    ...mockReviews
  ]

  const filteredReviews = allReviews.filter(review => {
    const matchesSearch = review.fromUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.feedback.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter)
    return matchesSearch && matchesRating
  })

  const averageRating = allReviews.length > 0 
    ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
    : '0.0'

  return (
    <div className="min-h-screen">
      <AdminHeader title="Reviews" />
      
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Total Reviews</p>
            <p className="text-2xl font-bold text-white">{allReviews.length}</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Average Rating</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-white">{averageRating}</p>
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">5 Star Reviews</p>
            <p className="text-2xl font-bold text-green-400">{allReviews.filter(r => r.rating === 5).length}</p>
          </div>
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">Low Reviews (1-2)</p>
            <p className="text-2xl font-bold text-red-400">{allReviews.filter(r => r.rating <= 2).length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#12121a] border border-gray-800 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            />
          </div>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value as any)}
            className="px-4 py-2.5 bg-[#12121a] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length > 0 ? filteredReviews.map((review) => (
            <div key={review.id} className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium shrink-0">
                    {review.fromUserName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-white">{review.fromUserName}</p>
                      <span className="text-gray-500">reviewed</span>
                      <p className="font-medium text-purple-400">{review.toUserName}</p>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{review.feedback}</p>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setShowActionMenu(showActionMenu === review.id ? null : review.id)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {showActionMenu === review.id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-[#1a1a24] border border-gray-800 rounded-lg shadow-xl z-10 overflow-hidden">
                      <button className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button className="w-full px-4 py-2.5 text-left text-sm text-yellow-400 hover:bg-gray-800 flex items-center gap-2">
                        <Flag className="w-4 h-4" /> Flag
                      </button>
                      <button className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-[#12121a] border border-gray-800/50 rounded-xl p-12 text-center">
              <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No reviews found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredReviews.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing {filteredReviews.length} reviews
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
        )}
      </div>
    </div>
  )
}
