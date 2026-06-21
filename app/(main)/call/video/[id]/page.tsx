'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, use, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, MicOff, Mic, Phone, Video, VideoOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { callsApi } from '@/lib/api/calls'
import { getUserDisplayInfo } from '@/lib/api/users'
import type { IAgoraRTCClient, IMicrophoneAudioTrack, ICameraVideoTrack } from 'agora-rtc-sdk-ng'
import type { CallResponse } from '@/lib/types/call'

type CallState = 'connecting' | 'ongoing' | 'ended' | 'error'

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!

function VideoCallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callIdParam = searchParams.get('callId')

  const [callState, setCallState] = useState<CallState>('connecting')
  const [callTime, setCallTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [otherName, setOtherName] = useState('Connecting...')
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false)

  const callRef = useRef<CallResponse | null>(null)
  const clientRef = useRef<IAgoraRTCClient | null>(null)
  const audioTrackRef = useRef<IMicrophoneAudioTrack | null>(null)
  const videoTrackRef = useRef<ICameraVideoTrack | null>(null)
  const localVideoRef = useRef<HTMLDivElement>(null)
  const remoteVideoRef = useRef<HTMLDivElement>(null)
  const endingRef = useRef(false)
  // Store remote user so we can play video once refs are in DOM
  const pendingRemoteRef = useRef<{ uid: string | number; videoTrack: unknown } | null>(null)

  const handleEndCall = async () => {
    if (endingRef.current) return
    endingRef.current = true
    setCallState('ended')
    audioTrackRef.current?.close()
    videoTrackRef.current?.close()
    await clientRef.current?.leave().catch(() => {})
    if (callRef.current) {
      await callsApi.endCall(callRef.current.id).catch(() => {})
    }
    window.history.back()
  }

  useEffect(() => {
    let cancelled = false

    async function setup() {
      try {
        const { default: AgoraRTC } = await import('agora-rtc-sdk-ng')

        const info = await getUserDisplayInfo(id)
        if (cancelled) return
        setOtherName(info.name)

        const call = callIdParam
          ? await callsApi.joinCall(callIdParam)
          : await callsApi.initiateCall(id, 'video')
        if (cancelled) return
        callRef.current = call

        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
        clientRef.current = client

        await client.join(APP_ID, call.channel_name, call.agora_token, null)
        if (cancelled) { await client.leave(); return }

        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
        if (cancelled) { audioTrack.close(); videoTrack.close(); await client.leave(); return }
        audioTrackRef.current = audioTrack
        videoTrackRef.current = videoTrack

        await client.publish([audioTrack, videoTrack])
        setCallState('ongoing')

        // Remote user events
        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType)
          if (mediaType === 'video') {
            setHasRemoteVideo(true)
            if (remoteVideoRef.current) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              user.videoTrack?.play(remoteVideoRef.current as any)
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              pendingRemoteRef.current = { uid: user.uid, videoTrack: user.videoTrack as any }
            }
          }
          if (mediaType === 'audio') user.audioTrack?.play()
        })

        client.on('user-unpublished', (_user, mediaType) => {
          if (mediaType === 'video') setHasRemoteVideo(false)
        })

        client.on('user-left', () => { handleEndCall() })

      } catch {
        if (!cancelled) setCallState('error')
      }
    }

    setup()
    return () => {
      cancelled = true
      audioTrackRef.current?.close()
      videoTrackRef.current?.close()
      clientRef.current?.leave().catch(() => {})
    }
  }, [id, callIdParam]) // eslint-disable-line react-hooks/exhaustive-deps

  // Play local video once the UI is in 'ongoing' state and ref is mounted
  useEffect(() => {
    if (callState !== 'ongoing') return
    if (localVideoRef.current && videoTrackRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      videoTrackRef.current.play(localVideoRef.current as any)
    }
    // Flush any pending remote video
    if (remoteVideoRef.current && pendingRemoteRef.current) {
      const { videoTrack } = pendingRemoteRef.current
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(videoTrack as any)?.play(remoteVideoRef.current)
      pendingRemoteRef.current = null
    }
  }, [callState])

  // Re-play local video when camera is turned back on
  useEffect(() => {
    if (callState !== 'ongoing' || isVideoOff) return
    if (localVideoRef.current && videoTrackRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      videoTrackRef.current.play(localVideoRef.current as any)
    }
  }, [isVideoOff, callState])

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

  const handleToggleVideo = () => {
    const next = !isVideoOff
    videoTrackRef.current?.setEnabled(!next)
    setIsVideoOff(next)
  }

  if (callState === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <p className="text-muted-foreground mb-4">Call failed to connect</p>
        <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
      </div>
    )
  }

  if (callState === 'connecting') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black">
        <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <p className="text-white/60 mt-4">Connecting video call...</p>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-black overflow-hidden">

      {/* Remote video — always in DOM so ref is stable */}
      <div ref={remoteVideoRef} className="absolute inset-0" />
      {!hasRemoteVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
          <p className="text-white/40 text-sm">Waiting for {otherName}…</p>
        </div>
      )}
      {/* Subtle overlay so controls stay readable */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center gap-4 p-4">
        <button onClick={() => window.history.back()} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-semibold text-white drop-shadow">{otherName}</h1>
          <span className="rounded-full bg-black/50 px-3 py-1 text-sm text-white">{formatTime(callTime)}</span>
        </div>
        <div className="w-12" />
      </header>

      {/* Local video (PiP) — always in DOM */}
      <div className="relative z-10 flex flex-1 items-end justify-end p-4">
        <div className="relative h-40 w-28 overflow-hidden rounded-2xl border-2 border-white shadow-xl bg-neutral-800">
          {isVideoOff ? (
            <div className="flex h-full items-center justify-center">
              <VideoOff className="w-8 h-8 text-white/40" />
            </div>
          ) : (
            <div ref={localVideoRef} className="h-full w-full" />
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 px-4 pb-10">
        <div className="mx-auto mb-4 flex max-w-xs items-center justify-center gap-6 rounded-full bg-white/90 backdrop-blur-sm p-4">
          <button
            onClick={handleToggleMute}
            className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-muted'}`}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>
          <button
            onClick={handleToggleVideo}
            className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${isVideoOff ? 'bg-red-500 text-white' : 'bg-muted'}`}
          >
            {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
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

export default function VideoCallPageWrapper({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense><VideoCallPage params={params} /></Suspense>
}
