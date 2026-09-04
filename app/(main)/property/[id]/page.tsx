import type { Metadata } from 'next'
import PropertyDetailClient from './PropertyDetailClient'
import type { ListingResponse } from '@/lib/types/listing'

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.spacebutton.net/api/v1').replace(/\/$/, '')

function isVideoUrl(url: string): boolean {
  return /\.(mp4|mov|avi|webm|m4v|mkv)(\?|$)/i.test(url) || url.includes('/video/upload/')
}

async function fetchListing(id: string): Promise<ListingResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/listings/${id}`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    const body = await res.json()
    return body?.data ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const listing = await fetchListing(id)

  if (!listing) {
    return { title: 'SpaceButton', description: 'Find your perfect apartment on SpaceButton.' }
  }

  const coverPhoto = [...listing.images]
    .filter((img) => !isVideoUrl(img.image_url))
    .sort((a, b) => (a.is_cover === b.is_cover ? a.order - b.order : a.is_cover ? -1 : 1))[0]

  const ogImage = coverPhoto?.image_url
  const location = [listing.address, listing.city, listing.state].filter(Boolean).join(', ')
  const description = `${location ? `${location} — ` : ''}${listing.description || 'View this space on SpaceButton.'}`.slice(0, 200)

  return {
    title: `${listing.title} | SpaceButton`,
    description,
    openGraph: {
      title: listing.title,
      description,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 900 }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: listing.title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PropertyDetailClient id={id} />
}
