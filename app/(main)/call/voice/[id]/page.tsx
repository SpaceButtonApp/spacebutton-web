'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, use, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { MicOff, Mic, Volume2, VolumeX, PhoneOff, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { callsApi } from '@/lib/api/calls'
import { getUserDisplayInfo } from '@/lib/api/users'
import type { IAgoraRTCClient, IMicrophoneAudioTrack, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng'
import type { CallResponse } from '@/lib/types/call'

type CallState = 'connecting' | 'calling' | 'ongoing' | 'ended' | 'error'

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!

function InitialsAvatar({ name, size }: { name: string; size: number }) {
  const initials = name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase() || '?'
  const colors = ['#6D28D9', '#7C3AED', '#2563EB', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444']
  const bg = colors[name.charCodeAt(0) % colors.length]
  return (
    <div
      style={{ width: size, height: size, background: bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 700, color: '#fff' }}
    >
      {initials}
    </div>
  )
}

function VoiceCallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callIdParam = searchParams.get('callId')

  const [callState, setCallState] = useState<CallState>('connecting')
  const [callTime, setCallTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOff, setIsSpeakerOff] = useState(false)
  const [otherName, setOtherName] = useState('Connecting...')
  const [otherAvatar, setOtherAvatar] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const callRef = useRef<CallResponse | null>(null)
  const clientRef = useRef<IAgoraRTCClient | null>(null)
  const audioTrackRef = useRef<IMicrophoneAudioTrack | null>(null)
  const remoteUsersRef = useRef<IAgoraRTCRemoteUser[]>([])
  const endingRef = useRef(false)

  const handleEndCall = async () => {
    if (endingRef.current) return
    endingRef.current = true
    setCallState('ended')
    audioTrackRef.current?.close()
    await clientRef.current?.leave().catch(() => {})
    if (callRef.current) {
      await callsApi.endCall(callRef.current.id).catch(() => {})
    }
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.replace('/messages')
    }
  }

  useEffect(() => {
    let cancelled = false

    async function setup() {
      try {
        const { default: AgoraRTC } = await import('agora-rtc-sdk-ng')

        const info = await getUserDisplayInfo(id)
        if (cancelled) return
        setOtherName(info.name)
        setOtherAvatar(info.avatar)

        let call: CallResponse
        if (callIdParam) {
          call = await callsApi.joinCall(callIdParam)
        } else {
          call = await callsApi.initiateCall(id, 'voice')
        }
        if (cancelled) return
        callRef.current = call
        setCallState('calling')

        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
        clientRef.current = client

        // Register handlers BEFORE join so we don't miss events from users
        // already in the channel when we arrive
        client.on('user-published', async (user, mediaType) => {
          if (mediaType !== 'audio') return
          await client.subscribe(user, 'audio')
          user.audioTrack?.play()
          remoteUsersRef.current = [...remoteUsersRef.current, user]
        })

        client.on('user-unpublished', (user) => {
          remoteUsersRef.current = remoteUsersRef.current.filter(u => u.uid !== user.uid)
        })

        client.on('user-left', () => { handleEndCall() })

        await client.join(APP_ID, call.channel_name, call.agora_token, null)
        if (cancelled) { await client.leave(); return }

        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack()
        if (cancelled) { audioTrack.close(); await client.leave(); return }
        audioTrackRef.current = audioTrack
        await client.publish([audioTrack])

        setCallState('ongoing')

      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err instanceof Error ? err.message : 'Call failed to connect.')
          setCallState('error')
        }
      }
    }

    setup()
    return () => {
      cancelled = true
      audioTrackRef.current?.close()
      clientRef.current?.leave().catch(() => {})
    }
  }, [id, callIdParam]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (callState !== 'ongoing') return
    const interval = setInterval(() => setCallTime(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [callState])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }

  const handleToggleMute = () => {
    const next = !isMuted
    audioTrackRef.current?.setEnabled(!next)
    setIsMuted(next)
  }

  const handleToggleSpeaker = () => {
    const next = !isSpeakerOff
    remoteUsersRef.current.forEach(u => u.audioTrack?.setVolume(next ? 0 : 100))
    setIsSpeakerOff(next)
  }

  if (callState === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <p className="text-muted-foreground mb-2">Call failed</p>
        <p className="text-sm text-destructive mb-6">{errorMsg}</p>
        <Button variant="outline" onClick={handleEndCall}>Go Back</Button>
      </div>
    )
  }

  if (callState === 'connecting' || callState === 'calling') {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="flex items-center gap-4 p-4">
          <div className="w-12" />
          <h1 className="flex-1 text-center text-xl font-semibold">
            {callState === 'connecting' ? 'Connecting...' : 'Calling...'}
          </h1>
          <div className="w-12" />
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="relative mb-6">
            {otherAvatar ? (
              <div className="relative h-48 w-48">
                <Image src={otherAvatar} alt={otherName} fill className="rounded-full object-cover" unoptimized />
                {callState === 'calling' && (
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                )}
              </div>
            ) : (
              <div className="relative">
                {callState === 'calling' && (
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                )}
                <InitialsAvatar name={otherName} size={192} />
              </div>
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
        <div className="w-12" />
        <div className="flex-1 text-center">
          <h1 className="text-xl font-semibold">{otherName}</h1>
          <span className="rounded-full bg-muted px-3 py-1 text-sm">{formatTime(callTime)}</span>
        </div>
        <div className="w-12" />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="relative mb-6">
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20" />
          {otherAvatar ? (
            <div className="relative h-48 w-48">
              <Image src={otherAvatar} alt={otherName} fill className="rounded-full border-4 border-white object-cover shadow-lg" unoptimized />
            </div>
          ) : (
            <div className="border-4 border-white shadow-lg rounded-full">
              <InitialsAvatar name={otherName} size={192} />
            </div>
          )}
        </div>
        <p className="text-muted-foreground text-sm mt-2">Voice Call</p>
      </div>

      <div className="px-4 pb-8">
        <div className="mx-auto mb-4 flex max-w-xs items-center justify-center gap-6 rounded-full bg-muted p-4">
          <button
            onClick={handleToggleSpeaker}
            className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${!isSpeakerOff ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
          >
            {isSpeakerOff ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </button>
          <button
            onClick={handleToggleMute}
            className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-background'}`}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
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
