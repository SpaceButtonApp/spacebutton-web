'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, use, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, MicOff, Phone, Video, VideoOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { callsApi } from '@/lib/api/calls'
import { getUserDisplayInfo } from '@/lib/api/users'
import type { CallResponse } from '@/lib/types/call'

type CallState = 'connecting' | 'ongoing' | 'ended' | 'error'

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'

export default function VideoCallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callIdParam = searchParams.get('callId')

  const [callState, setCallState] = useState<CallState>('connecting')
  const [callTime, setCallTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [otherName, setOtherName] = useState('Connecting...')
  const [otherAvatar, setOtherAvatar] = useState<string | null>(null)
  const callRef = useRef<CallResponse | null>(null)

  useEffect(() => {
    let cancelled = false
    async function setup() {
      try {
        const info = await getUserDisplayInfo(id)
        if (cancelled) return
        setOtherName(info.name)
        setOtherAvatar(info.avatar)

        const call = callIdParam
          ? await callsApi.joinCall(callIdParam)
          : await callsApi.initiateCall(id, 'video')
        if (cancelled) return
        callRef.current = call
        setCallState('ongoing')
      } catch {
        if (!cancelled) setCallState('error')
      }
    }
    setup()
    return () => { cancelled = true }
  }, [id, callIdParam])

  useEffect(() => {
    if (callState !== 'ongoing') return
    const interval = setInterval(() => setCallTime((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [callState])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }

  const handleEndCall = async () => {
    setCallState('ended')
    if (callRef.current) await callsApi.endCall(callRef.current.id).catch(() => {})
    router.back()
  }

  const avatar = otherAvatar || DEFAULT_AVATAR

  if (callState === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <p className="text-muted-foreground mb-4">Call failed to connect</p>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  if (callState === 'connecting') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground mt-4">Connecting video call...</p>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Remote video (full-screen background placeholder) */}
      <div className="absolute inset-0">
        <Image src={avatar} alt={otherName} fill className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-black/30" />

      {/* Header */}
      <header className="relative z-10 flex items-center gap-4 p-4">
        <button onClick={() => router.back()} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-semibold text-white">{otherName}</h1>
          <span className="rounded-full bg-black/50 px-3 py-1 text-sm text-white">{formatTime(callTime)}</span>
        </div>
        <div className="w-12" />
      </header>

      {/* Local video (PiP placeholder) */}
      <div className="relative z-10 flex flex-1 items-end justify-end p-4">
        <div className="relative h-40 w-28 overflow-hidden rounded-2xl border-2 border-white shadow-lg bg-muted flex items-center justify-center">
          {isVideoOff ? (
            <VideoOff className="w-8 h-8 text-muted-foreground" />
          ) : (
            <p className="text-xs text-muted-foreground text-center px-2">Camera preview</p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 px-4 pb-8">
        <div className="mx-auto mb-4 flex max-w-xs items-center justify-center gap-6 rounded-full bg-white/90 p-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex h-14 w-14 items-center justify-center rounded-full ${isMuted ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            <MicOff className="h-6 w-6" />
          </button>
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`flex h-14 w-14 items-center justify-center rounded-full ${isVideoOff ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
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
