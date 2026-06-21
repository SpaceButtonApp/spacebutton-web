'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  MessageCircle,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Video,
  Phone,
  PhoneOff,
} from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { useAppStore } from '@/lib/store'
import { chatApi } from '@/lib/api/chat'
import { callsApi } from '@/lib/api/calls'
import { getUserDisplayInfo } from '@/lib/api/users'
import { formatDistanceToNow } from 'date-fns'
import type { ChatResponse } from '@/lib/types/chat'
import type { CallResponse } from '@/lib/types/call'

const DEFAULT_AVATAR = '/placeholder-user.jpg'

interface DisplayInfo { name: string; avatar: string | null }

type Tab = 'chats' | 'calls'

function formatDuration(seconds?: number): string {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function CallItem({
  call,
  myId,
  displayInfos,
  router,
}: {
  call: CallResponse
  myId: string
  displayInfos: Record<string, DisplayInfo>
  router: ReturnType<typeof useRouter>
}) {
  const isOutgoing = call.caller_id === myId
  const otherId = isOutgoing ? call.receiver_id : call.caller_id
  const info = displayInfos[otherId]
  const name = info?.name ?? 'Unknown'
  const avatar = info?.avatar ?? DEFAULT_AVATAR
  const isMissed = call.status === 'missed' || call.status === 'rejected'

  const directionLabel = () => {
    if (call.status === 'rejected') return isOutgoing ? 'Declined' : 'Declined'
    if (call.status === 'missed') return 'Missed'
    if (call.status === 'initiated') return isOutgoing ? 'Cancelled' : 'No answer'
    return isOutgoing ? 'Outgoing' : 'Incoming'
  }

  const DirectionIcon = () => {
    if (isMissed) return <PhoneMissed className="w-4 h-4 text-destructive" />
    if (isOutgoing) return <PhoneOutgoing className="w-4 h-4 text-green-500" />
    return <PhoneIncoming className="w-4 h-4 text-primary" />
  }

  const TypeIcon = call.call_type === 'video'
    ? <Video className="w-4 h-4" />
    : <Phone className="w-4 h-4" />

  return (
    <button
      onClick={() => router.push(`/profile/${otherId}`)}
      className="w-full flex gap-3 p-3 rounded-xl bg-secondary border border-border hover:border-primary/30 transition-all duration-200 text-left"
    >
      <div className="relative flex-shrink-0">
        <Image
          src={avatar}
          alt={name}
          width={56}
          height={56}
          className="rounded-full object-cover w-14 h-14"
          unoptimized
        />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center">
          {TypeIcon}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-foreground truncate">{name}</h3>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <DirectionIcon />
          <span className={`text-sm ${isMissed ? 'text-destructive' : 'text-muted-foreground'}`}>
            {directionLabel()} {call.call_type === 'video' ? 'video' : 'voice'} call
          </span>
          {call.duration_seconds ? (
            <span className="text-xs text-muted-foreground ml-1">
              · {formatDuration(call.duration_seconds)}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  )
}

export default function MessagesPage() {
  const router = useRouter()
  const { user, setUnreadChatsCount } = useAppStore()

  const [tab, setTab] = useState<Tab>('chats')

  // Chats state
  const [chats, setChats] = useState<ChatResponse[]>([])
  const [chatInfos, setChatInfos] = useState<Record<string, DisplayInfo>>({})
  const [chatsLoading, setChatsLoading] = useState(true)

  // Calls state
  const [calls, setCalls] = useState<CallResponse[]>([])
  const [callInfos, setCallInfos] = useState<Record<string, DisplayInfo>>({})
  const [callsLoading, setCallsLoading] = useState(false)
  const [callsLoaded, setCallsLoaded] = useState(false)

  const myId = user?.id ?? ''

  // Load chats on mount
  useEffect(() => {
    if (!user) return
    chatApi.getChats()
      .then(async ({ chats: list }) => {
        setChats(list)
        const unread = list.filter((c) =>
          c.user_id === myId ? c.user_unread_count > 0 : c.agent_unread_count > 0
        ).length
        setUnreadChatsCount(unread)
        const otherIds = [...new Set(list.map((c) =>
          c.user_id === myId ? c.agent_id : c.user_id
        ))]
        const results = await Promise.allSettled(
          otherIds.map((id) => getUserDisplayInfo(id).then((info) => ({ id, info })))
        )
        const map: Record<string, DisplayInfo> = {}
        results.forEach((r) => {
          if (r.status === 'fulfilled') map[r.value.id] = r.value.info
        })
        setChatInfos(map)
      })
      .catch(() => {})
      .finally(() => setChatsLoading(false))
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load call history when Calls tab is first opened
  useEffect(() => {
    if (tab !== 'calls' || callsLoaded || !user) return
    setCallsLoading(true)
    callsApi.getHistory()
      .then(async ({ calls: list }) => {
        setCalls(list)
        const otherIds = [...new Set(list.map((c) =>
          c.caller_id === myId ? c.receiver_id : c.caller_id
        ))]
        const results = await Promise.allSettled(
          otherIds.map((id) => getUserDisplayInfo(id).then((info) => ({ id, info })))
        )
        const map: Record<string, DisplayInfo> = {}
        results.forEach((r) => {
          if (r.status === 'fulfilled') map[r.value.id] = r.value.info
        })
        setCallInfos(map)
      })
      .catch(() => {})
      .finally(() => { setCallsLoading(false); setCallsLoaded(true) })
  }, [tab, callsLoaded, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-xl px-4 py-4 sticky top-0 z-40 border-b border-border">
        <h1 className="text-xl font-bold text-center text-foreground">Messages</h1>

        {/* Tab switcher */}
        <div className="flex mt-3 rounded-xl bg-secondary p-1 gap-1">
          <button
            onClick={() => setTab('chats')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'chats'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Chats
          </button>
          <button
            onClick={() => setTab('calls')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'calls'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Phone className="w-4 h-4" />
            Calls
          </button>
        </div>
      </div>

      <div className="px-4 py-4">

        {/* ── CHATS TAB ── */}
        {tab === 'chats' && (
          chatsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-secondary animate-pulse">
                  <div className="w-14 h-14 rounded-full bg-muted flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4">
                <MessageCircle className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">No Messages</h2>
              <p className="text-muted-foreground text-center">
                Start a conversation with property owners.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {chats.map((chat) => {
                const otherId = chat.user_id === myId ? chat.agent_id : chat.user_id
                const info = chatInfos[otherId]
                const name = info?.name ?? 'Loading...'
                const avatar = info?.avatar ?? DEFAULT_AVATAR
                const unread = chat.user_id === myId ? chat.user_unread_count : chat.agent_unread_count

                return (
                  <button
                    key={chat.id}
                    onClick={() => router.push(`/chat/${chat.id}`)}
                    className="w-full flex gap-3 p-3 rounded-xl bg-secondary border border-border hover:border-primary/30 transition-all duration-200 text-left"
                  >
                    <div className="relative flex-shrink-0">
                      <Image
                        src={avatar}
                        alt={name}
                        width={56}
                        height={56}
                        className="rounded-full object-cover w-14 h-14"
                        unoptimized
                      />
                      {unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                          <span className="text-[10px] text-primary-foreground font-bold leading-none">
                            {unread > 9 ? '9+' : unread}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-foreground truncate">{name}</h3>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatDistanceToNow(new Date(chat.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {chat.last_message ?? 'No messages yet'}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )
        )}

        {/* ── CALLS TAB ── */}
        {tab === 'calls' && (
          callsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-secondary animate-pulse">
                  <div className="w-14 h-14 rounded-full bg-muted flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : calls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4">
                <PhoneOff className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">No Calls</h2>
              <p className="text-muted-foreground text-center">
                Your call history will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {calls.map((call) => (
                <CallItem
                  key={call.id}
                  call={call}
                  myId={myId}
                  displayInfos={callInfos}
                  router={router}
                />
              ))}
            </div>
          )
        )}
      </div>

      <BottomNav />
    </div>
  )
}
