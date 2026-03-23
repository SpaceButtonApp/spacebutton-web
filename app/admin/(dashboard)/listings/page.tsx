'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { 
  ListChecks, 
  CheckCircle2,
  XCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Eye,
  X,
  MoreVertical
} from 'lucide-react'

const mockListings = [
  { id: 'C2600001', name: 'Three Bedroom Flat', category: 'Connect', price: 1500000, type: 'Roommate', status: 'Active' },
  { id: 'C2600002', name: 'A room self. con', category: 'Connect', price: 400000, type: 'Rent', status: 'Closed' },
  { id: 'A2600001', name: 'Mini Flat', category: 'Agent', price: 500000, type: 'Flatmate', status: 'Closed' },
  { id: 'C2600003', name: 'Four Bedroom Flat', category: 'Connect', price: 1000000, type: 'Flatmate', status: 'Active' },
  { id: 'C2600004', name: 'Two Bedroom Flat', category: 'Connect', price: 1000000, type: 'Rent', status: 'Active' },
  { id: 'A2600002', name: 'Boys Quarter', category: 'Agent', price: 250000, type: 'Roommate', status: 'Closed' },
  { id: 'A2600003', name: 'Studio Apartment', category: 'Agent', price: 800000, type: 'Rent', status: 'Active' },
]

export default function ListingsPage() {
  const { properties, closedProperties, closeProperty } = useAppStore()
  const [currentPage, setCurrentPage] = useState(1)
  const [showDropdown, setShowDropdown] = useState<string | null>(null)

  const totalPosts = properties.length > 0 ? properties.length * 1000 : 200000
  const activePosts = (properties.length - closedProperties.length) * 1000 || 70000
  const closedPosts = closedProperties.length * 1000 || 143000

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'Closed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-secondary text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <ListChecks className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-sm text-muted-foreground">Total Post</span>
          </div>
          <p className="text-3xl font-bold mb-1">{totalPosts.toLocaleString()}</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              5%
            </span>
            <span className="text-muted-foreground">+120 this month</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm text-muted-foreground">Active Post</span>
          </div>
          <p className="text-3xl font-bold mb-1">{activePosts.toLocaleString()}</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              10%
            </span>
            <span className="text-muted-foreground">+200 this month</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <XCircle className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm text-muted-foreground">Closed Post</span>
          </div>
          <p className="text-3xl font-bold mb-1">{closedPosts.toLocaleString()}</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              8%
            </span>
            <span className="text-muted-foreground">+20 this month</span>
          </div>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">ID</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Apartment Name</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Category</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Price</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Type</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {mockListings.map((listing) => (
              <tr key={listing.id} className="border-t border-border hover:bg-secondary/30">
                <td className="px-6 py-4 text-sm font-medium">{listing.id}</td>
                <td className="px-6 py-4 text-sm">{listing.name}</td>
                <td className="px-6 py-4 text-sm">{listing.category}</td>
                <td className="px-6 py-4 text-sm">₦{listing.price.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">{listing.type}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                    {listing.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 relative">
                    <button 
                      className="p-2 hover:bg-secondary rounded-lg border border-border"
                      onClick={() => setShowDropdown(showDropdown === listing.id ? null : listing.id)}
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {showDropdown === listing.id && (
                      <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
                        <button className="w-full px-4 py-2 text-sm text-left hover:bg-secondary flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button className="w-full px-4 py-2 text-sm text-left hover:bg-secondary flex items-center gap-2 text-red-500">
                          <X className="w-4 h-4" />
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm ${
                  currentPage === page
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary'
                }`}
              >
                {page}
              </button>
            ))}
            <span className="px-2">.....</span>
            <button className="w-8 h-8 rounded-lg text-sm hover:bg-secondary">24</button>
          </div>
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
