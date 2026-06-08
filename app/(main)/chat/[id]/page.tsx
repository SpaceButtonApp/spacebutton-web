'use client'

import { useState, use, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Video, Phone, MoreVertical, Send, X, Check, CheckSquare,
  MessageSquare, Star, Flag, ArrowLeft,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { chatApi } from '@/lib/api/chat'
import { reviewApi } from '@/lib/api/users'
import { getUserDisplayInfo } from '@/lib/api/users'
import { listingsApi, mapListing } from '@/lib/api/listings'
import { useChatWs } from '@/lib/hooks/use-chat-ws'
import { cn } from '@/lib/utils'
import type { ChatResponse, MessageResponse, DoneDealState } from '@/lib/types/chat'
import type { Property } from '@/lib/mock-data'

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
const DEFAULT_PROPERTY_IMG = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop'

interface DisplayInfo { name: string; avatar: string | null }

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

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const myId = user?.id ?? ''

  // ─── Load chat + messages on mount ─────────────────────────────────────────
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

        // Mark read
        chatApi.markRead(chatId).catch(() => {})

        // Load other party display info
        const otherId = chatData.user_id === myId ? chatData.agent_id : chatData.user_id
        const info = await getUserDisplayInfo(otherId).catch(() => null)
        setOtherInfo(info)

        // Load listing if present
        if (chatData.listing_id) {
          const l = await listingsApi.getListing(chatData.listing_id).catch(() => null)
          if (l) setListing(mapListing(l, new Set()))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [chatId, myId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Scroll to bottom when messages change ──────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ─── WebSocket ──────────────────────────────────────────────────────────────
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
    } else if (event.type === 'read_receipt') {
      // could mark messages as read visually — skip for now
    }
  }, [chatId, myId])

  const { wsMessage, wsTyping, wsRead } = useChatWs(loading ? null : chatId, handleWsEvent as Parameters<typeof useChatWs>[1])

  // ─── Mark read via WS when page is focused ──────────────────────────────────
  useEffect(() => {
    if (!loading) wsRead()
  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Send message ───────────────────────────────────────────────────────────
  const handleSend = async () => {
    const content = input.trim()
    if (!content || sending) return
    setInput('')
    setSending(true)

    // Optimistic
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
      // Replace optimistic with saved
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? saved : m))
      )
      // Broadcast via WebSocket so the other party gets it in real-time
      wsMessage(content)
    } catch {
      // Remove optimistic on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
    } finally {
      setSending(false)
    }
  }

  // ─── Typing indicator ───────────────────────────────────────────────────────
  const handleInputChange = (v: string) => {
    setInput(v)
    wsTyping(true)
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => wsTyping(false), 1500)
  }

  // ─── Done deal ──────────────────────────────────────────────────────────────
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

  // ─── Submit review ──────────────────────────────────────────────────────────
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
    } catch {}
    setShowFeedback(false)
    setShowMenu(false)
    setRating(0)
    setFeedbackText('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Chat not found</h1>
          <button
            onClick={() => router.push('/messages')}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
          >
            Back to Messages
          </button>
        </div>
      </div>
    )
  }

  const otherId = chat.user_id === myId ? chat.agent_id : chat.user_id
  const otherName = otherInfo?.name ?? 'User'
  const otherAvatar = otherInfo?.avatar ?? DEFAULT_AVATAR

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-background px-4 py-3 border-b border-border flex items-center gap-3 sticky top-0 z-40">
        <button
          onClick={() => router.push('/messages')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => router.push(`/user/${otherId}`)}
          className="flex items-center gap-3 flex-1"
        >
          <Image
            src={otherAvatar}
            alt={otherName}
            width={44}
            height={44}
            className="rounded-full object-cover w-11 h-11 flex-shrink-0"
            unoptimized
          />
          <div className="text-left">
            <h2 className="font-semibold text-foreground">{otherName}</h2>
            {isTyping && (
              <p className="text-xs text-primary animate-pulse">Typing...</p>
            )}
          </div>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push(`/call/voice/${otherId}`)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push(`/call/video/${otherId}`)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Property banner */}
      {listing && (
        <div className="px-4 py-2">
          <button
            onClick={() => router.push(`/property/${listing.id}`)}
            className="w-full bg-secondary rounded-xl overflow-hidden border border-border hover:bg-secondary/80 transition-colors"
          >
            <div className="flex gap-3 p-3">
              <Image
                src={listing.images?.[0] ?? DEFAULT_PROPERTY_IMG}
                alt={listing.title}
                width={72}
                height={72}
                className="rounded-lg object-cover w-18 h-18 flex-shrink-0"
                unoptimized
              />
              <div className="flex-1 text-left min-w-0">
                <p className="font-semibold text-sm line-clamp-1">{listing.title}</p>
                <p className="text-muted-foreground text-xs">{listing.location}</p>
                <p className="text-primary font-bold text-sm mt-1">
                  ₦{listing.price.toLocaleString()}
                </p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Menu */}
      {showMenu && !showFeedback && !showReportModal && (
        <div className="mx-4 mt-2 bg-background rounded-xl border border-border shadow-lg overflow-hidden z-50">
          <button
            onClick={() => { router.push(`/user/${otherId}`); setShowMenu(false) }}
            className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors border-b border-border"
          >
            <span className="font-medium">View Profile</span>
          </button>

          <button
            onClick={() => { setShowDoneDealInfo(true); setShowMenu(false) }}
            className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors border-b border-border"
          >
            <p className="text-sm text-muted-foreground">Learn about Done Deal</p>
          </button>

          {doneDeal && (
            <button
              onClick={handleDoneDeal}
              disabled={doneDeal.deal_locked}
              className={cn(
                'w-full flex items-center justify-between px-4 py-4 transition-colors border-b border-border',
                doneDeal.deal_locked ? 'bg-green-500/10 cursor-not-allowed' : 'hover:bg-secondary',
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-6 h-6 rounded border-2 flex items-center justify-center',
                  doneDeal.deal_locked
                    ? 'bg-green-500 border-green-500'
                    : doneDeal.my_done_deal
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground',
                )}>
                  {(doneDeal.my_done_deal || doneDeal.deal_locked) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <span className="font-medium">Done Deal</span>
                  {doneDeal.my_done_deal && !doneDeal.deal_locked && (
                    <p className="text-xs text-primary">Waiting for other party...</p>
                  )}
                  {doneDeal.deal_locked && (
                    <p className="text-xs text-green-500">Deal completed!</p>
                  )}
                </div>
              </div>
            </button>
          )}

          <button
            onClick={() => setShowFeedback(true)}
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary transition-colors border-b border-border"
          >
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Leave Review</span>
          </button>

          <button
            onClick={() => { setShowReportModal(true); setShowMenu(false) }}
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary transition-colors text-destructive"
          >
            <Flag className="w-5 h-5" />
            <span className="font-medium">Report User</span>
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 px-4 py-4 overflow-auto space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === myId
            return (
              <div
                key={msg.id}
                className={cn(
                  'max-w-[80%] px-4 py-3 rounded-2xl',
                  isOwn
                    ? 'ml-auto bg-primary text-primary-foreground rounded-br-sm'
                    : 'mr-auto bg-secondary text-foreground rounded-bl-sm border border-border',
                )}
              >
                <p className="text-sm leading-relaxed">
                  {msg.is_deleted ? (
                    <span className="italic opacity-60">This message was deleted</span>
                  ) : msg.content}
                </p>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-background border-t border-border">
        <div className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="Message here..."
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1 h-12 rounded-full border-border bg-secondary px-4"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </div>

      {/* Done deal info modal */}
      {showDoneDealInfo && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="w-full max-w-md rounded-t-3xl bg-background p-6 pb-8">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted" />
            <p className="font-semibold text-lg mb-3">How to use Done Deal</p>
            <p className="text-muted-foreground text-sm mb-4">
              Use this feature after a successful transaction between both parties.
            </p>
            <div className="space-y-2 bg-secondary p-4 rounded-xl text-sm text-muted-foreground mb-6">
              <p>1. Both parties agree on a deal outside the app</p>
              <p>2. Each party taps &quot;Done Deal&quot; in this chat&apos;s menu</p>
              <p>3. When both confirm, the deal is locked</p>
            </div>
            <Button onClick={() => setShowDoneDealInfo(false)} className="w-full rounded-xl">
              Got it
            </Button>
          </div>
        </div>
      )}

      {/* Congrats modal */}
      {showCongrats && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-background p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
            <p className="text-muted-foreground mb-6">
              Both parties confirmed the deal. This chat has been archived.
            </p>
            <Button
              onClick={() => { setShowCongrats(false); router.push('/messages') }}
              className="w-full rounded-xl"
            >
              Back to Messages
            </Button>
          </div>
        </div>
      )}

      {/* Feedback / review modal */}
      {showFeedback && (
        <div className="mx-4 mt-2 bg-background rounded-xl border border-border shadow-lg p-4 z-50 fixed bottom-24 left-0 right-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Leave a Review</h3>
            <button onClick={() => { setShowFeedback(false); setShowMenu(false) }}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Rate your experience</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="p-1">
                  <Star className={cn(
                    'w-8 h-8 transition-colors',
                    star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground',
                  )} />
                </button>
              ))}
            </div>
          </div>
          <textarea
            placeholder="Write your review..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="w-full h-20 p-3 rounded-xl border border-border bg-background resize-none text-sm"
          />
          <Button
            onClick={handleSubmitFeedback}
            disabled={rating === 0 || !feedbackText.trim()}
            className="w-full mt-4 h-12 rounded-xl"
          >
            Submit Review
          </Button>
        </div>
      )}

      {/* Report modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-background p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Flag className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-bold text-lg">Report User</h3>
              </div>
              <button onClick={() => setShowReportModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 mb-6">
              {[
                { id: 'scam', label: 'Scam or Fraud' },
                { id: 'harassment', label: 'Harassment' },
                { id: 'fake', label: 'Fake Content' },
                { id: 'other', label: 'Other' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedReportReason(r.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border-2 transition-all text-sm font-medium',
                    selectedReportReason === r.id
                      ? 'border-destructive bg-destructive/5'
                      : 'border-border hover:border-destructive/30',
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {selectedReportReason === 'other' && (
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Describe the issue..."
                className="w-full h-20 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none mb-4"
              />
            )}
            <div className="space-y-2">
              <button
                disabled={!selectedReportReason || (selectedReportReason === 'other' && !reportDetails.trim())}
                onClick={() => setShowReportModal(false)}
                className={cn(
                  'w-full h-12 rounded-lg font-medium transition-colors',
                  selectedReportReason
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    : 'bg-secondary text-muted-foreground cursor-not-allowed',
                )}
              >
                Submit Report
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="w-full h-12 rounded-lg border border-border font-medium hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
