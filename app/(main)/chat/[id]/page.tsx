'use client'

import { useState, use, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Video, Phone, MoreVertical, Send, X, Check, CheckSquare,
  MessageSquare, Star, Flag, ArrowLeft, CheckCheck,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { chatApi } from '@/lib/api/chat'
import { reviewApi, userApi, getUserDisplayInfo } from '@/lib/api/users'
import { listingsApi, mapListing } from '@/lib/api/listings'
import { useChatWs } from '@/lib/hooks/use-chat-ws'
import { cn } from '@/lib/utils'
import type { ChatResponse, MessageResponse, DoneDealState } from '@/lib/types/chat'
import type { Property } from '@/lib/mock-data'

const DEFAULT_AVATAR = '/placeholder-user.jpg'
const DEFAULT_PROPERTY_IMG = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop'

interface DisplayInfo { name: string; avatar: string | null; isAvailable: boolean; role: string }

function formatMsgTime(iso: string) {
  const d = new Date(iso)
  const h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`
}

function formatDateSep(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: chatId } = use(params)
  const router = useRouter()
  const { user } = useAppStore()

  const [chat, setChat] = useState<ChatResponse | null>(null)
  const [otherInfo, setOtherInfo] = useState<DisplayInfo | null>(null)
  const [listing, setListing] = useState<Property | null>(null)
  const [messages, setMessages] = useState<MessageResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState('')

  const [doneDeal, setDoneDeal] = useState<DoneDealState | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showDoneDealInfo, setShowDoneDealInfo] = useState(false)
  const [showCongrats, setShowCongrats] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedReportReason, setSelectedReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [rating, setRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showUserPopup, setShowUserPopup] = useState(false)
  const [popupProfile, setPopupProfile] = useState<{ bio: string | null; rating: number; reviewCount: number } | null>(null)
  const [popupLoading, setPopupLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const myId = user?.id ?? ''

  useEffect(() => {
    Promise.all([
      chatApi.getChat(chatId),
      chatApi.getMessages(chatId),
      chatApi.getDoneDeal(chatId),
    ])
      .then(async ([chatData, msgData, dd]) => {
        setChat(chatData)
        setMessages(msgData.messages)
        setDoneDeal(dd)
        chatApi.markRead(chatId).catch(() => {})
        const otherId = chatData.user_id === myId ? chatData.agent_id : chatData.user_id
        const info = await getUserDisplayInfo(otherId).catch(() => null)
        setOtherInfo(info)
        if (chatData.listing_id) {
          const l = await listingsApi.getListing(chatData.listing_id).catch(() => null)
          if (l) setListing(mapListing(l, new Set()))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [chatId, myId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleWsEvent = useCallback((event: { type: string; sender_id?: string; content?: string; is_typing?: boolean; user_id?: string }) => {
    if (event.type === 'message' && event.sender_id && event.content) {
      const pseudo: MessageResponse = {
        id: `ws-${Date.now()}`,
        chat_id: chatId,
        sender_id: event.sender_id,
        content: event.content,
        status: 'delivered',
        is_deleted: false,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, pseudo])
    } else if (event.type === 'typing' && event.user_id !== myId) {
      setIsTyping(!!event.is_typing)
    }
  }, [chatId, myId])

  const { wsMessage, wsTyping, wsRead } = useChatWs(loading ? null : chatId, handleWsEvent as Parameters<typeof useChatWs>[1])

  useEffect(() => {
    if (!loading) wsRead()
  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async () => {
    const content = input.trim()
    if (!content || sending) return
    setInput('')
    setSending(true)
    const optimistic: MessageResponse = {
      id: `opt-${Date.now()}`,
      chat_id: chatId,
      sender_id: myId,
      content,
      status: 'sent',
      is_deleted: false,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])
    try {
      const saved = await chatApi.sendMessage(chatId, content)
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? saved : m)))
      wsMessage(content)
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
    } finally {
      setSending(false)
    }
  }

  const handleInputChange = (v: string) => {
    setInput(v)
    wsTyping(true)
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => wsTyping(false), 1500)
  }

  const handleDoneDeal = async () => {
    if (!doneDeal || doneDeal.deal_locked) return
    try {
      const updated = await chatApi.toggleDoneDeal(chatId)
      setDoneDeal(updated)
      if (updated.deal_locked) {
        setShowMenu(false)
        setShowCongrats(true)
      }
    } catch {}
  }

  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [reviewError, setReviewError] = useState('')

  const handleSubmitFeedback = async () => {
    if (rating === 0 || !feedbackText.trim() || !chat) return
    const otherId = chat.user_id === myId ? chat.agent_id : chat.user_id
    try {
      await reviewApi.createReview(otherId, {
        rating,
        comment: feedbackText.trim(),
        is_verified_deal: doneDeal?.deal_locked ?? false,
        chat_id: chatId,
      })
      setReviewSubmitted(true)
      setReviewError('')
      setTimeout(() => {
        setShowFeedback(false)
        setShowMenu(false)
        setRating(0)
        setFeedbackText('')
        setReviewSubmitted(false)
      }, 1500)
    } catch {
      setReviewError('Failed to submit review. Please try again.')
    }
  }

  const handleOpenUserPopup = async () => {
    if (!chat) return
    const targetId = chat.user_id === myId ? chat.agent_id : chat.user_id
    setShowUserPopup(true)
    if (popupProfile) return
    setPopupLoading(true)
    const [profileRes, reviewsRes] = await Promise.allSettled([
      userApi.getPublicProfile(targetId),
      reviewApi.getAgentReviews(targetId),
    ])
    setPopupProfile({
      bio: profileRes.status === 'fulfilled' ? profileRes.value.bio : null,
      rating: reviewsRes.status === 'fulfilled' ? reviewsRes.value.average_rating : 0,
      reviewCount: reviewsRes.status === 'fulfilled' ? reviewsRes.value.total : 0,
    })
    setPopupLoading(false)
  }

  if (loading) {
    return (
      <div className="h-[100dvh] bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="h-[100dvh] bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Chat not found</h1>
          <button onClick={() => router.push('/messages')} className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium">
            Back to Messages
          </button>
        </div>
      </div>
    )
  }

  const otherId = chat.user_id === myId ? chat.agent_id : chat.user_id
  const isOtherAvailable = otherInfo?.isAvailable ?? true
  const otherName = isOtherAvailable ? (otherInfo?.name ?? 'User') : 'User not available'
  const otherAvatar = otherInfo?.avatar ?? DEFAULT_AVATAR

  return (
    <div className="flex flex-col h-[100dvh] bg-background overflow-hidden">
      {/* ── Header ── */}
      <div className="bg-background px-4 py-3 border-b border-border flex items-center gap-3 flex-shrink-0 z-40">
        <button
          onClick={() => router.push('/messages')}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button onClick={handleOpenUserPopup} className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <Image
              src={otherAvatar}
              alt={otherName}
              width={42}
              height={42}
              className="rounded-full object-cover w-[42px] h-[42px] border-2 border-border"
              unoptimized
            />
            {isOtherAvailable && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
            )}
          </div>
          <div className="text-left min-w-0">
            <h2 className="font-semibold text-foreground text-sm truncate">{otherName}</h2>
            {!isOtherAvailable ? (
              <p className="text-xs text-muted-foreground">Account no longer available</p>
            ) : isTyping ? (
              <p className="text-xs text-primary animate-pulse">typing…</p>
            ) : (
              <p className="text-xs text-muted-foreground">Online</p>
            )}
          </div>
        </button>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => router.push(`/call/voice/${otherId}`)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors">
            <Phone className="w-4.5 h-4.5 w-[18px] h-[18px]" />
          </button>
          <button onClick={() => router.push(`/call/video/${otherId}`)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors">
            <Video className="w-[18px] h-[18px]" />
          </button>
          <button onClick={() => setShowMenu((v) => !v)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors">
            <MoreVertical className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

      {/* ── Property banner ── */}
      {listing && (
        <div className="px-4 py-2 border-b border-border bg-secondary/50 flex-shrink-0">
          <button onClick={() => router.push(`/property/${listing.id}`)} className="w-full flex items-center gap-3">
            <Image
              src={listing.images?.[0] ?? DEFAULT_PROPERTY_IMG}
              alt={listing.title}
              width={52}
              height={52}
              className="rounded-xl object-cover w-13 h-13 flex-shrink-0"
              unoptimized
            />
            <div className="flex-1 text-left min-w-0">
              <p className="font-semibold text-sm truncate">{listing.title}</p>
              <p className="text-muted-foreground text-xs truncate">{listing.location}</p>
              <p className="text-primary font-bold text-sm">₦{listing.price.toLocaleString()}</p>
            </div>
          </button>
        </div>
      )}

      {/* ── Dropdown menu ── */}
      {showMenu && !showFeedback && !showReportModal && (
        <div className="absolute top-[57px] right-4 z-50 w-56 bg-background rounded-xl border border-border shadow-xl overflow-hidden">
          <button onClick={() => { setShowDoneDealInfo(true); setShowMenu(false) }}
            className="w-full text-left px-4 py-3 hover:bg-secondary text-sm transition-colors border-b border-border text-muted-foreground">
            What is Done Deal?
          </button>
          {doneDeal && (
            <button onClick={handleDoneDeal} disabled={doneDeal.deal_locked}
              className={cn('w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b border-border',
                doneDeal.deal_locked ? 'bg-green-500/10 cursor-not-allowed' : 'hover:bg-secondary')}>
              <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                doneDeal.deal_locked ? 'bg-green-500 border-green-500' : doneDeal.my_done_deal ? 'bg-primary border-primary' : 'border-muted-foreground')}>
                {(doneDeal.my_done_deal || doneDeal.deal_locked) && <Check className="w-3 h-3 text-white" />}
              </div>
              <div>
                <p className="font-medium">Done Deal</p>
                {doneDeal.deal_locked && <p className="text-xs text-green-500">Completed!</p>}
                {doneDeal.my_done_deal && !doneDeal.deal_locked && <p className="text-xs text-primary">Waiting…</p>}
              </div>
            </button>
          )}
          <button onClick={() => setShowFeedback(true)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary text-sm transition-colors border-b border-border">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            Leave Review
          </button>
          <button onClick={() => { setShowReportModal(true); setShowMenu(false) }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary text-sm transition-colors text-destructive">
            <Flag className="w-4 h-4" />
            Report User
          </button>
        </div>
      )}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-1">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg.sender_id === myId
            const prev = messages[index - 1]
            const next = messages[index + 1]

            const showDate = !prev ||
              new Date(prev.created_at).toDateString() !== new Date(msg.created_at).toDateString()

            // Show avatar only on the last consecutive message from the other party
            const showAvatar = !isOwn && (!next || next.sender_id !== msg.sender_id)
            // Group consecutive messages — reduce gap when same sender
            const sameAsPrev = prev && prev.sender_id === msg.sender_id

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border">
                      {formatDateSep(msg.created_at)}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}

                <div className={cn(
                  'flex items-end gap-2',
                  isOwn ? 'justify-end' : 'justify-start',
                  sameAsPrev ? 'mt-0.5' : 'mt-3',
                )}>
                  {/* Avatar placeholder for incoming (keeps alignment) */}
                  {!isOwn && (
                    <div className="w-8 h-8 flex-shrink-0">
                      {showAvatar ? (
                        <Image
                          src={otherAvatar}
                          alt={otherName}
                          width={32}
                          height={32}
                          className="rounded-full object-cover w-8 h-8"
                          unoptimized
                        />
                      ) : null}
                    </div>
                  )}

                  <div className={cn('flex flex-col max-w-[72%]', isOwn ? 'items-end' : 'items-start')}>
                    <div className={cn(
                      'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-secondary text-foreground rounded-bl-sm border border-border/60',
                    )}>
                      {msg.is_deleted ? (
                        <span className="italic opacity-60 text-xs">This message was deleted</span>
                      ) : msg.content}
                    </div>

                    {/* Time + status */}
                    <div className={cn('flex items-center gap-1 mt-0.5 px-1', isOwn ? 'flex-row-reverse' : 'flex-row')}>
                      <span className="text-[10px] text-muted-foreground">{formatMsgTime(msg.created_at)}</span>
                      {isOwn && (
                        msg.status === 'read'
                          ? <CheckCheck className="w-3.5 h-3.5 text-primary" />
                          : <Check className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <div className="flex-shrink-0 px-4 py-3 bg-background border-t border-border">
        {!isOtherAvailable ? (
          <p className="text-center text-sm text-muted-foreground py-2">
            This user&apos;s account is no longer available
          </p>
        ) : doneDeal?.deal_locked ? (
          <p className="text-center text-sm text-green-600 py-2 font-medium">
            ✓ Deal completed — this chat is now closed
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              className="flex-1 h-11 rounded-full border-border bg-secondary px-4 text-sm focus-visible:ring-1 focus-visible:ring-primary"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="w-11 h-11 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-40 active:scale-95"
            >
              <Send className="w-4.5 h-4.5 w-[18px] h-[18px] text-primary-foreground" />
            </button>
          </div>
        )}
      </div>

      {/* ── Done deal info modal ── */}
      {showDoneDealInfo && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="w-full max-w-md rounded-t-3xl bg-background p-6 pb-8">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted" />
            <p className="font-semibold text-lg mb-3">How to use Done Deal</p>
            <p className="text-muted-foreground text-sm mb-4">Use this after a successful transaction between both parties.</p>
            <div className="space-y-2 bg-secondary p-4 rounded-xl text-sm text-muted-foreground mb-6">
              <p>1. Both parties agree on a deal outside the app</p>
              <p>2. Each party taps &quot;Done Deal&quot; in this chat&apos;s menu</p>
              <p>3. When both confirm, the deal is locked</p>
            </div>
            <Button onClick={() => setShowDoneDealInfo(false)} className="w-full rounded-xl">Got it</Button>
          </div>
        </div>
      )}

      {/* ── Congrats modal ── */}
      {showCongrats && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-background p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
            <p className="text-muted-foreground mb-6">Both parties confirmed the deal. This chat has been closed.</p>
            <div className="space-y-3">
              <Button
                onClick={() => { setShowCongrats(false); setShowFeedback(true) }}
                className="w-full rounded-xl"
              >
                Leave a Review
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowCongrats(false); router.push('/messages') }}
                className="w-full rounded-xl"
              >
                Back to Messages
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Review modal ── */}
      {showFeedback && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="w-full max-w-md rounded-t-3xl bg-background p-6 pb-8">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted" />
            {reviewSubmitted ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-bold text-lg text-green-600">Review Submitted!</p>
                <p className="text-sm text-muted-foreground">Thank you for your feedback.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-lg">Leave a Review</h3>
                  <button
                    onClick={() => { setShowFeedback(false); setShowMenu(false); setReviewError('') }}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Rate your experience</p>
                <div className="flex gap-2 mb-5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setRating(star)} className="p-1">
                      <Star className={cn('w-8 h-8 transition-colors', star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground')} />
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Write your review…"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full h-24 p-3 rounded-xl border border-border bg-background resize-none text-sm mb-4"
                />
                {reviewError && (
                  <p className="text-sm text-destructive mb-3 text-center">{reviewError}</p>
                )}
                <Button onClick={handleSubmitFeedback} disabled={rating === 0 || !feedbackText.trim()} className="w-full h-12 rounded-xl">
                  Submit Review
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Report modal ── */}
      {/* User profile popup */}
      {showUserPopup && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center sm:items-center p-4"
          onClick={() => setShowUserPopup(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-background p-6 flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowUserPopup(false)}
              className="self-end w-8 h-8 flex items-center justify-center rounded-full bg-secondary"
            >
              <X className="w-4 h-4" />
            </button>

            <Image
              src={otherAvatar}
              alt={otherName}
              width={80}
              height={80}
              className="rounded-full object-cover border-4 border-border"
              unoptimized
            />

            <h3 className="text-xl font-bold text-foreground text-center">{otherName}</h3>

            {popupLoading ? (
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {(popupProfile?.reviewCount ?? 0) > 0 && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            'w-5 h-5',
                            s <= Math.round(popupProfile!.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground',
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {popupProfile!.rating.toFixed(1)} · {popupProfile!.reviewCount}{' '}
                      {popupProfile!.reviewCount === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                )}

                {popupProfile?.bio && (
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    {popupProfile.bio}
                  </p>
                )}

                <button
                  onClick={() => { setShowUserPopup(false); router.push(`/user/${otherId}`) }}
                  className="w-full h-11 rounded-xl bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  View Full Profile
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-background p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Flag className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="font-bold text-lg">Report User</h3>
              </div>
              <button onClick={() => setShowReportModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 mb-5">
              {[
                { id: 'scam', label: 'Scam or Fraud' },
                { id: 'harassment', label: 'Harassment' },
                { id: 'fake', label: 'Fake Content' },
                { id: 'other', label: 'Other' },
              ].map((r) => (
                <button key={r.id} onClick={() => setSelectedReportReason(r.id)}
                  className={cn('w-full text-left p-3 rounded-xl border-2 transition-all text-sm font-medium',
                    selectedReportReason === r.id ? 'border-destructive bg-destructive/5' : 'border-border hover:border-destructive/30')}>
                  {r.label}
                </button>
              ))}
            </div>
            {selectedReportReason === 'other' && (
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Describe the issue…"
                className="w-full h-20 px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none mb-4"
              />
            )}
            <div className="space-y-2">
              <button
                disabled={!selectedReportReason || (selectedReportReason === 'other' && !reportDetails.trim())}
                onClick={() => setShowReportModal(false)}
                className={cn('w-full h-12 rounded-xl font-medium transition-colors',
                  selectedReportReason ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-secondary text-muted-foreground cursor-not-allowed')}>
                Submit Report
              </button>
              <button onClick={() => setShowReportModal(false)} className="w-full h-12 rounded-xl border border-border font-medium hover:bg-secondary transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
