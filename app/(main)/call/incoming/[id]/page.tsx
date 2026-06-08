'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, Phone, PhoneOff } from 'lucide-react'
import { callsApi } from '@/lib/api/calls'
import { getUserDisplayInfo } from '@/lib/api/users'
import type { CallResponse } from '@/lib/types/call'

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'

export default function IncomingCallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [call, setCall] = useState<CallResponse | null>(null)
  const [callerName, setCallerName] = useState('Incoming Call')
  const [callerAvatar, setCallerAvatar] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const callData = await callsApi.getCall(id)
        if (cancelled) return
        setCall(callData)
        const info = await getUserDisplayInfo(callData.caller_id)
        if (cancelled) return
        setCallerName(info.name)
        setCallerAvatar(info.avatar)
      } catch { /* show defaults */ }
      finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  const handleAccept = async () => {
    if (!call) return
    // Join the call first, then navigate to voice page with callId
    router.push(`/call/voice/${call.caller_id}?callId=${id}`)
  }

  const handleDecline = async () => {
    await callsApi.endCall(id, 'rejected').catch(() => {})
    router.back()
  }

  const avatar = callerAvatar || DEFAULT_AVATAR

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-4 p-4">
        <button onClick={() => router.back()} className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-1 text-center text-xl font-semibold">
          {loading ? 'Incoming Call...' : 'Ringing...'}
        </h1>
        <div className="w-12" />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4">
        {loading ? (
          <div className="w-48 h-48 rounded-full bg-muted animate-pulse" />
        ) : (
          <>
            <div className="relative mb-6 h-48 w-48">
              <div className="absolute inset-0 animate-ping rounded-full bg-green-500/20" />
              <Image src={avatar} alt={callerName} fill className="rounded-full object-cover" />
            </div>
            <h2 className="text-2xl font-semibold">{callerName}</h2>
            <p className="text-muted-foreground mt-2">Voice Call</p>
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-16 px-4 pb-32">
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleDecline}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg"
          >
            <PhoneOff className="h-7 w-7" />
          </button>
          <span className="text-sm text-muted-foreground">Decline</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleAccept}
            disabled={loading || !call}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lg disabled:opacity-50"
          >
            <Phone className="h-7 w-7" />
          </button>
          <span className="text-sm text-muted-foreground">Accept</span>
        </div>
      </div>
    </div>
  )
}
