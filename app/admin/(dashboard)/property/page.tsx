'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAppStore } from '@/lib/store'
import { 
  Building2, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  Bed,
  Bath,
  Square
} from 'lucide-react'

const mockProperties = [
  { 
    id: 1, 
    name: '4 Bedroom Duplex', 
    location: 'Lekki Phase 1, Lagos',
    price: 85000000, 
    beds: 4,
    baths: 5,
    sqft: 3500,
    type: 'Sale',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop'
  },
  { 
    id: 2, 
    name: '2 Bedroom Flat', 
    location: 'Victoria Island, Lagos',
    price: 3500000, 
    beds: 2,
    baths: 2,
    sqft: 1200,
    type: 'Rent',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'
  },
  { 
    id: 3, 
    name: '3 Bedroom Apartment', 
    location: 'Ikoyi, Lagos',
    price: 120000000, 
    beds: 3,
    baths: 4,
    sqft: 2800,
    type: 'Sale',
    status: 'Sold',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'
  },
  { 
    id: 4, 
    name: '5 Bedroom Mansion', 
    location: 'Banana Island, Lagos',
    price: 450000000, 
    beds: 5,
    baths: 7,
    sqft: 6500,
    type: 'Sale',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop'
  },
  { 
    id: 5, 
    name: 'Studio Apartment', 
    location: 'Yaba, Lagos',
    price: 800000, 
    beds: 1,
    baths: 1,
    sqft: 450,
    type: 'Rent',
    status: 'Rented',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop'
  },
  { 
    id: 6, 
    name: '3 Bedroom Bungalow', 
    location: 'Ikeja GRA, Lagos',
    price: 55000000, 
    beds: 3,
    baths: 3,
    sqft: 2200,
    type: 'Sale',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop'
  },
]

export default function PropertyPage() {
  const [currentPage, setCurrentPage] = useState(1)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'Sold': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'Rented': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      default: return 'bg-secondary text-muted-foreground'
    }
  }

  const formatPrice = (price: number, type: string) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(0)}M${type === 'Rent' ? '/year' : ''}`
    }
    return `₦${price.toLocaleString()}${type === 'Rent' ? '/year' : ''}`
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Building2 className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-sm text-muted-foreground">Total Properties</span>
          </div>
          <p className="text-3xl font-bold mb-1">2,456</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              8%
            </span>
            <span className="text-muted-foreground">+65 this month</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm text-muted-foreground">For Sale</span>
          </div>
          <p className="text-3xl font-bold mb-1">1,890</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              5%
            </span>
            <span className="text-muted-foreground">+30 this month</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm text-muted-foreground">For Rent</span>
          </div>
          <p className="text-3xl font-bold mb-1">566</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              12%
            </span>
            <span className="text-muted-foreground">+35 this month</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm text-muted-foreground">Total Value</span>
          </div>
          <p className="text-3xl font-bold mb-1">₦45B</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              18%
            </span>
            <span className="text-muted-foreground">this quarter</span>
          </div>
        </div>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-3 gap-6">
        {mockProperties.map((property) => (
          <div key={property.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <Image
                src={property.image}
                alt={property.name}
                fill
                className="object-cover"
              />
              <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground`}>
                {property.type}
              </span>
              <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                {property.status}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-1">{property.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                <MapPin className="w-4 h-4" />
                {property.location}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  {property.beds}
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4" />
                  {property.baths}
                </div>
                <div className="flex items-center gap-1">
                  <Square className="w-4 h-4" />
                  {property.sqft.toLocaleString()} sqft
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  {formatPrice(property.price, property.type)}
                </span>
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
