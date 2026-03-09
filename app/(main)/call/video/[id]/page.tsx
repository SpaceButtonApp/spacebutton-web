'use client'

import { useState, useEffect, use, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, MessageSquare, MicOff, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { mockConversations } from '@/lib/mock-data'

export default function VideoCallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [callTime, setCallTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)

  const conversation = useMemo(() => mockConversations.find((c) => c.id === id), [id])
  const callerName = conversation?.name || 'Unknown'

  useEffect(() => {
    const interval = setInterval(() => {
      setCallTime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleEndCall = () => {
    router.back()
  }

  if (!conversation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <p className="text-muted-foreground">Conversation not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Remote video (full screen background) */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1200&fit=crop"
          alt="Remote video"
          fill
          className="object-cover"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Header */}
      <header className="relative z-10 flex items-center gap-4 p-4">
        <button
          onClick={() => router.back()}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-semibold text-white">{callerName}</h1>
          <span className="rounded-full bg-black/50 px-3 py-1 text-sm text-white">
            {formatTime(callTime)}
          </span>
        </div>
        <div className="w-12" />
      </header>

      {/* Local video (picture-in-picture) */}
      <div className="relative z-10 flex flex-1 items-end justify-end p-4">
        <div className="relative h-40 w-28 overflow-hidden rounded-2xl border-2 border-white shadow-lg">
          <Image
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=300&fit=crop"
            alt="Local video"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 px-4 pb-8">
        <div className="mx-auto mb-4 flex max-w-xs items-center justify-center gap-6 rounded-full bg-white/90 p-4">
          <button className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <MessageSquare className="h-6 w-6" />
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex h-14 w-14 items-center justify-center rounded-full ${
              isMuted ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            <MicOff className="h-6 w-6" />
          </button>
          <button className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Phone className="h-6 w-6" />
          </button>
        </div>

        <Button
          onClick={handleEndCall}
          className="mx-auto flex w-full max-w-xs items-center justify-center gap-4 rounded-full bg-red-500 py-6 text-white hover:bg-red-600"
        >
          <span className="text-lg font-medium">End Call</span>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600">
            <Phone className="h-5 w-5 rotate-[135deg]" />
          </div>
        </Button>
      </div>
    </div>
  )
}
