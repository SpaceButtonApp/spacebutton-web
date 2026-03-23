'use client'

import { AdminHeader } from '@/components/admin-v2/header'
import { useAppStore } from '@/lib/store'
import { 
  Users, 
  Building2, 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreHorizontal,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function DashboardPage() {
  const { properties, closedProperties, reviews, transactions } = useAppStore()

  // Calculate stats from real data
  const totalUsers = 1250 // Mock - would come from DB
  const totalListings = properties.length
  const activeListings = properties.filter(p => !closedProperties.includes(p.id)).length
  const closedDeals = closedProperties.length
  const totalRevenue = transactions.reduce((sum, t) => t.type === 'credit' ? sum + t.amount : sum, 0)

  const stats = [
    { 
      label: 'Total Users', 
      value: totalUsers.toLocaleString(), 
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'purple'
    },
    { 
      label: 'Active Listings', 
      value: activeListings.toString(), 
      change: '+8.2%',
      trend: 'up',
      icon: Building2,
      color: 'blue'
    },
    { 
      label: 'Closed Deals', 
      value: closedDeals.toString(), 
      change: '+23.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'green'
    },
    { 
      label: 'Revenue', 
      value: `N${totalRevenue.toLocaleString()}`, 
      change: '+5.4%',
      trend: 'up',
      icon: CreditCard,
      color: 'orange'
    },
  ]

  const recentListings = properties.slice(0, 5)
  const recentReviews = reviews.slice(0, 4)

  return (
    <div className="min-h-screen">
      <AdminHeader title="Dashboard" />
      
      <div className="p-6 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/20 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome back, Admin!</h2>
          <p className="text-gray-400">Here&apos;s what&apos;s happening with SpaceButton today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stat.color === 'purple' ? 'bg-purple-500/20' :
                  stat.color === 'blue' ? 'bg-blue-500/20' :
                  stat.color === 'green' ? 'bg-green-500/20' :
                  'bg-orange-500/20'
                }`}>
                  <stat.icon className={`w-6 h-6 ${
                    stat.color === 'purple' ? 'text-purple-400' :
                    stat.color === 'blue' ? 'text-blue-400' :
                    stat.color === 'green' ? 'text-green-400' :
                    'text-orange-400'
                  }`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Listings */}
          <div className="lg:col-span-2 bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-gray-800/50 flex items-center justify-between">
              <h3 className="font-semibold text-white">Recent Listings</h3>
              <Link href="/admin-v2/listings" className="text-sm text-purple-400 hover:text-purple-300">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800/50">
                    <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Property</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Type</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Price</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Status</th>
                    <th className="text-right text-xs font-medium text-gray-400 uppercase px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentListings.map((listing) => (
                    <tr key={listing.id} className="border-b border-gray-800/30 hover:bg-gray-800/20">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-800 overflow-hidden">
                            {listing.images?.[0] && (
                              <Image 
                                src={listing.images[0]} 
                                alt={listing.title} 
                                width={40} 
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white truncate max-w-[150px]">{listing.title}</p>
                            <p className="text-xs text-gray-500">{listing.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          listing.type === 'connect' 
                            ? 'bg-purple-500/20 text-purple-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {listing.type === 'connect' ? 'Connect' : 'Agent'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-white">
                        N{listing.price?.toLocaleString() || '0'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                          closedProperties.includes(listing.id) 
                            ? 'text-gray-400' 
                            : 'text-green-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            closedProperties.includes(listing.id) 
                              ? 'bg-gray-400' 
                              : 'bg-green-400'
                          }`} />
                          {closedProperties.includes(listing.id) ? 'Closed' : 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="p-1 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-white">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-[#12121a] border border-gray-800/50 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-gray-800/50 flex items-center justify-between">
              <h3 className="font-semibold text-white">Recent Reviews</h3>
              <Link href="/admin-v2/reviews" className="text-sm text-purple-400 hover:text-purple-300">
                View all
              </Link>
            </div>
            <div className="p-3">
              {recentReviews.length > 0 ? recentReviews.map((review) => (
                <div key={review.id} className="p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium shrink-0">
                      {review.fromUserName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">{review.fromUserName}</p>
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map((star) => (
                            <svg key={star} className={`w-3 h-3 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{review.feedback}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No reviews yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin-v2/users" className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5 hover:border-purple-500/50 transition-all group">
            <Users className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-white mb-1">Manage Users</h4>
            <p className="text-sm text-gray-400">View and manage all platform users</p>
          </Link>
          <Link href="/admin-v2/listings" className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5 hover:border-blue-500/50 transition-all group">
            <Building2 className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-white mb-1">Manage Listings</h4>
            <p className="text-sm text-gray-400">Review and approve property listings</p>
          </Link>
          <Link href="/admin-v2/transactions" className="bg-[#12121a] border border-gray-800/50 rounded-xl p-5 hover:border-green-500/50 transition-all group">
            <CreditCard className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-white mb-1">View Transactions</h4>
            <p className="text-sm text-gray-400">Track all platform transactions</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
