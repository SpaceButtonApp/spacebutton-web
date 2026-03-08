"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, MoreVertical, MapPin, Users, Building2, Bookmark } from "lucide-react"
import Image from "next/image"
import { BottomNav } from "@/components/bottom-nav"
import { PropertyCard } from "@/components/property-card"
import { mockProperties, mockUsers } from "@/lib/mock-data"

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"reviews" | "listings" | "closed">("listings")

  const user = mockUsers.find((u) => u.id === id) || mockUsers[0]
  const userProperties = mockProperties.filter((p) => p.ownerId === user.id)

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background px-4 py-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Profile</h1>
        <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      <div className="px-4">
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-28 h-28 rounded-full overflow-hidden mb-4">
            <Image
              src={user.avatar}
              alt={user.name}
              fill
              className="object-cover"
            />
          </div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-muted-foreground capitalize">{user.type}</p>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 text-center p-4 rounded-2xl border border-border">
            <p className="text-2xl font-bold">{user.stats.listings}</p>
            <p className="text-sm text-muted-foreground">Listings</p>
          </div>
          <div className="flex-1 text-center p-4 rounded-2xl border border-border">
            <p className="text-2xl font-bold">{user.stats.closed}</p>
            <p className="text-sm text-muted-foreground">Closed</p>
          </div>
          <div className="flex-1 text-center p-4 rounded-2xl border border-border">
            <p className="text-2xl font-bold">{user.stats.rating}</p>
            <p className="text-sm text-muted-foreground">Rating</p>
          </div>
        </div>

        <div className="bg-secondary rounded-full p-1 flex mb-6">
          {(["reviews", "listings", "closed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-full text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? "bg-background shadow-sm" : ""
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "listings" && (
          <div className="space-y-4">
            {userProperties.length > 0 ? (
              userProperties.map((property) => (
                <PropertyCard key={property.id} property={property} variant="horizontal" />
              ))
            ) : (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No listings yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No reviews yet</p>
          </div>
        )}

        {activeTab === "closed" && (
          <div className="text-center py-12">
            <Bookmark className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No closed deals</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
