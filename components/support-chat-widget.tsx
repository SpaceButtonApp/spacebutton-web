'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, X, Send, Loader2, ChevronDown } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { supportApi } from '@/lib/api/chat'
import type { SupportMsg } from '@/lib/api/chat'

export function SupportChatWidget() {
  const pathname = usePathname()
  const user = useAppStore((s) => s.user)

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<SupportMsg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMsgCountRef = useRef(0)

  // Hide on admin and auth routes
  const hidden = pathname.startsWith('/admin') ||
    pathname === '/login' || pathname === '/signup' ||
    pathname.startsWith('/forgot') || pathname.startsWith('/verify') ||
    pathname === '/welcome' || pathname === '/get-started'

  const loadMessages = useCallback(async () => {
    try {
      const msgs = await supportApi.getMessages()
      setMessages(msgs)
      if (!open) {
        const newCount = msgs.length - lastMsgCountRef.current
        if (newCount > 0 && lastMsgCountRef.current > 0) {
          const hasNewAdminMsg = msgs.slice(-newCount).some(m => m.sender === 'admin')
          if (hasNewAdminMsg) setUnread(prev => prev + newCount)
        }
      }
      lastMsgCountRef.current = msgs.length
    } catch { /* ignore */ }
  }, [open])

  // Initialize chat on first open
  useEffect(() => {
    if (!open || initialized || !user) return
    setLoading(true)
    const name = user.name || user.email || 'User'
    supportApi.init(name)
      .catch(() => {})
      .finally(() => {
        setInitialized(true)
        loadMessages().finally(() => setLoading(false))
      })
  }, [open, initialized, user, loadMessages])

  // Poll for new messages when open
  useEffect(() => {
    if (!open || !initialized) return
    const interval = setInterval(loadMessages, 5_000)
    return () => clearInterval(interval)
  }, [open, initialized, loadMessages])

  // Poll for unread badge when closed (every 30s)
  useEffect(() => {
    if (open || !user || hidden) return
    const interval = setInterval(loadMessages, 30_000)
    return () => clearInterval(interval)
  }, [open, user, hidden, loadMessages])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  // Clear unread when opened
  useEffect(() => {
    if (open) setUnread(0)
  }, [open])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    const text = input.trim()
    setInput('')
    try {
      const sent = await supportApi.send(text)
      setMessages(prev => [...prev, sent])
      lastMsgCountRef.current += 1
    } catch {
      setInput(text)
    }
    finally { setSending(false) }
  }

  if (hidden || !user) return null

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-80 sm:w-96 flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-[#12121a]" style={{ maxHeight: '70vh' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#703BF7]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">SpaceButton Support</p>
                <p className="text-purple-200 text-xs">We typically reply in minutes</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="w-6 h-6 animate-spin text-[#703BF7]" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">Send us a message and we'll get back to you shortly.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-start' : 'justify-end'}`}>
                  {msg.sender === 'admin' && (
                    <div className="w-6 h-6 rounded-full bg-[#703BF7] flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0 mt-1">S</div>
                  )}
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    msg.sender === 'admin'
                      ? 'bg-[#1a1a24] text-white rounded-tl-none'
                      : 'bg-[#703BF7] text-white rounded-tr-none'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'admin' ? 'text-gray-500' : 'text-purple-200'}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-800 bg-[#0a0a0f]">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2.5 bg-[#1a1a24] border border-gray-800 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#703BF7]/50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="p-2.5 rounded-xl bg-[#703BF7] hover:bg-[#5f32d4] disabled:bg-gray-700 disabled:cursor-not-allowed text-white transition-colors"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[#703BF7] hover:bg-[#5f32d4] shadow-lg shadow-[#703BF7]/30 flex items-center justify-center text-white transition-all active:scale-95"
        aria-label="Support chat"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </>
  )
}
