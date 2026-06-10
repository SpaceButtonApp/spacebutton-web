'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, use, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, MicOff, Volume2, PhoneOff, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { callsApi } from '@/lib/api/calls'
import { getUserDisplayInfo } from '@/lib/api/users'
import type { CallResponse } from '@/lib/types/call'

type CallState = 'connecting' | 'calling' | 'ongoing' | 'ended' | 'error'

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'

function VoiceCallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callIdParam = searchParams.get('callId')  // set when joining an incoming call

  const [callState, setCallState] = useState<CallState>('connecting')
  const [callTime, setCallTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [otherName, setOtherName] = useState('Connecting...')
  const [otherAvatar, setOtherAvatar] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const callRef = useRef<CallResponse | null>(null)

  useEffect(() => {
    let cancelled = false

    async function setup() {
      try {
        // Resolve display info for the other party
        const info = await getUserDisplayInfo(id)
        if (cancelled) return
        setOtherName(info.name)
        setOtherAvatar(info.avatar)

        // Either join an existing call (incoming) or initiate a new one (outgoing)
        let call: CallResponse
        if (callIdParam) {
          call = await callsApi.joinCall(callIdParam)
        } else {
          call = await callsApi.initiateCall(id, 'voice')
        }
        if (cancelled) return
        callRef.current = call
        setCallState('calling')

        // Simulate brief ringing before connecting
        await new Promise((r) => setTimeout(r, 2000))
        if (cancelled) return
        setCallState('ongoing')
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err instanceof Error ? err.message : 'Call failed to connect.')
          setCallState('error')
        }
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
    if (callRef.current) {
      await callsApi.endCall(callRef.current.id).catch(() => {})
    }
    router.back()
  }

  const avatar = otherAvatar || DEFAULT_AVATAR

  if (callState === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <p className="text-muted-foreground mb-2">Call failed</p>
        <p className="text-sm text-destructive mb-6">{errorMsg}</p>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  if (callState === 'connecting' || callState === 'calling') {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="flex items-center gap-4 p-4">
          <button onClick={() => router.back()} className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="flex-1 text-center text-xl font-semibold">
            {callState === 'connecting' ? 'Connecting...' : 'Calling...'}
          </h1>
          <div className="w-12" />
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="relative mb-6 h-48 w-48">
            <Image src={avatar} alt={otherName} fill className="rounded-full object-cover" />
            {callState === 'calling' && (
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            )}
          </div>
          <h2 className="text-2xl font-semibold">{otherName}</h2>
          <p className="text-muted-foreground mt-2">
            {callState === 'connecting' ? 'Setting up call...' : 'Ringing...'}
          </p>
        </div>

        <div className="px-4 pb-12 flex justify-center">
          <button onClick={handleEndCall} className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg">
            <PhoneOff className="h-7 w-7" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-4 p-4">
        <button onClick={() => router.back()} className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-semibold">{otherName}</h1>
          <span className="rounded-full bg-muted px-3 py-1 text-sm">{formatTime(callTime)}</span>
        </div>
        <div className="w-12" />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="relative mb-6 h-48 w-48">
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20" />
          <Image src={avatar} alt={otherName} fill className="rounded-full border-4 border-white object-cover shadow-lg" />
        </div>
        <p className="text-muted-foreground text-sm mt-2">Voice Call</p>
      </div>

      <div className="px-4 pb-8">
        <div className="mx-auto mb-4 flex max-w-xs items-center justify-center gap-6 rounded-full bg-muted p-4">
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`flex h-14 w-14 items-center justify-center rounded-full ${isSpeakerOn ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
          >
            <Volume2 className="h-6 w-6" />
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex h-14 w-14 items-center justify-center rounded-full ${isMuted ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
          >
            <MicOff className="h-6 w-6" />
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

export default function VoiceCallPageWrapper({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense><VoiceCallPage params={params} /></Suspense>
}
