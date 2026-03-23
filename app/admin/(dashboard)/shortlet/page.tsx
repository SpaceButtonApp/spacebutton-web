'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAppStore } from '@/lib/store'
import { 
  Home, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  Star
} from 'lucide-react'

const mockShortlets = [
  { 
    id: 1, 
    name: 'Luxury Beach House', 
    location: 'Lagos Island, Lagos',
    price: 75000, 
    rating: 4.8,
    reviews: 24,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop'
  },
  { 
    id: 2, 
    name: 'Cozy Studio Apartment', 
    location: 'Victoria Island, Lagos',
    price: 35000, 
    rating: 4.5,
    reviews: 18,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'
  },
  { 
    id: 3, 
    name: 'Modern City Loft', 
    location: 'Lekki Phase 1, Lagos',
    price: 50000, 
    rating: 4.9,
    reviews: 31,
    status: 'Booked',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'
  },
  { 
    id: 4, 
    name: 'Garden Villa', 
    location: 'Ikeja GRA, Lagos',
    price: 120000, 
    rating: 4.7,
    reviews: 15,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop'
  },
  { 
    id: 5, 
    name: 'Penthouse Suite', 
    location: 'Ikoyi, Lagos',
    price: 200000, 
    rating: 5.0,
    reviews: 42,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop'
  },
  { 
    id: 6, 
    name: 'Minimalist Flat', 
    location: 'Yaba, Lagos',
    price: 25000, 
    rating: 4.3,
    reviews: 12,
    status: 'Inactive',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop'
  },
]

export default function ShortletPage() {
  const [currentPage, setCurrentPage] = useState(1)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'Booked': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      case 'Inactive': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-secondary text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Home className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-sm text-muted-foreground">Total Shortlets</span>
          </div>
          <p className="text-3xl font-bold mb-1">1,234</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              12%
            </span>
            <span className="text-muted-foreground">+45 this month</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Calendar className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm text-muted-foreground">Active Bookings</span>
          </div>
          <p className="text-3xl font-bold mb-1">456</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              8%
            </span>
            <span className="text-muted-foreground">+20 this week</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Star className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm text-muted-foreground">Avg. Rating</span>
          </div>
          <p className="text-3xl font-bold mb-1">4.7</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              0.2
            </span>
            <span className="text-muted-foreground">from last month</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm text-muted-foreground">Revenue</span>
          </div>
          <p className="text-3xl font-bold mb-1">₦12.5M</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              15%
            </span>
            <span className="text-muted-foreground">this month</span>
          </div>
        </div>
      </div>

      {/* Shortlet Grid */}
      <div className="grid grid-cols-3 gap-6">
        {mockShortlets.map((shortlet) => (
          <div key={shortlet.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <Image
                src={shortlet.image}
                alt={shortlet.name}
                fill
                className="object-cover"
              />
              <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(shortlet.status)}`}>
                {shortlet.status}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-1">{shortlet.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <MapPin className="w-4 h-4" />
                {shortlet.location}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold">₦{shortlet.price.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">/night</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-medium">{shortlet.rating}</span>
                  <span className="text-sm text-muted-foreground">({shortlet.reviews})</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary flex items-center justify-center gap-1">
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button className="flex-1 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary flex items-center justify-center gap-1">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button className="py-2 px-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button className="p-2 hover:bg-secondary rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        {[1, 2, 3, 4, 5].map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-10 h-10 rounded-lg text-sm ${
              currentPage === page
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-secondary'
            }`}
          >
            {page}
          </button>
        ))}
        <button className="p-2 hover:bg-secondary rounded-lg">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
