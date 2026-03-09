'use client'

import { useState, useEffect, use, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, MessageSquare, Volume2, MicOff, Video, Phone, PhoneOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BottomNav } from '@/components/bottom-nav'
import { mockConversations } from '@/lib/mock-data'

type CallState = 'calling' | 'ringing' | 'ongoing'

// Default avatar fallback
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'

export default function VoiceCallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [callState, setCallState] = useState<CallState>('calling')
  const [callTime, setCallTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)

  const conversation = useMemo(() => mockConversations.find((c) => c.id === id), [id])

  useEffect(() => {
    if (callState === 'calling') {
      const timer = setTimeout(() => {
        setCallState('ongoing')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [callState])

  useEffect(() => {
    if (callState === 'ongoing') {
      const interval = setInterval(() => {
        setCallTime((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [callState])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleEndCall = () => {
    router.back()
  }

  // Use safe values if conversation is not found
  const callerName = conversation?.name || 'Unknown'
  const callerAvatar = conversation?.avatar || DEFAULT_AVATAR

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

  if (callState === 'calling') {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="flex items-center gap-4 p-4">
          <button
            onClick={() => router.back()}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-muted"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="flex-1 text-center text-xl font-semibold">Calling ...</h1>
          <div className="w-12" />
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="relative mb-6 h-48 w-48">
            <Image
              src={callerAvatar}
              alt={callerName}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-semibold">{callerName}</h2>
        </div>

        <div className="px-4 pb-8">
          <div className="mx-auto flex max-w-xs items-center justify-center gap-6 rounded-full bg-muted p-4">
            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`flex h-14 w-14 items-center justify-center rounded-full ${
                isSpeakerOn ? 'bg-primary text-primary-foreground' : 'bg-background'
              }`}
            >
              <Volume2 className="h-6 w-6" />
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`flex h-14 w-14 items-center justify-center rounded-full ${
                isMuted ? 'bg-primary text-primary-foreground' : 'bg-background'
              }`}
            >
              <MicOff className="h-6 w-6" />
            </button>
            <button className="flex h-14 w-14 items-center justify-center rounded-full bg-background">
              <Video className="h-6 w-6" />
            </button>
            <button
              onClick={handleEndCall}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-4 p-4">
        <button
          onClick={() => router.back()}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-muted"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-semibold">{callerName}</h1>
          <span className="rounded-full bg-muted px-3 py-1 text-sm">{formatTime(callTime)}</span>
        </div>
        <div className="w-12" />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="relative mb-6 h-48 w-48">
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20" />
          <Image
            src={conversation.avatar}
            alt={conversation.name}
            fill
            className="rounded-full border-4 border-white object-cover shadow-lg"
          />
        </div>
      </div>

      <div className="px-4 pb-8">
        <div className="mx-auto mb-4 flex max-w-xs items-center justify-center gap-6 rounded-full bg-muted p-4">
          <button className="flex h-14 w-14 items-center justify-center rounded-full bg-background">
            <MessageSquare className="h-6 w-6" />
          </button>
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`flex h-14 w-14 items-center justify-center rounded-full ${
              isSpeakerOn ? 'bg-primary text-primary-foreground' : 'bg-background'
            }`}
          >
            <Volume2 className="h-6 w-6" />
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex h-14 w-14 items-center justify-center rounded-full ${
              isMuted ? 'bg-primary text-primary-foreground' : 'bg-background'
            }`}
          >
            <MicOff className="h-6 w-6" />
          </button>
          <button className="flex h-14 w-14 items-center justify-center rounded-full bg-background">
            <Video className="h-6 w-6" />
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
