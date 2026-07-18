'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, MessageCircle } from 'lucide-react'
import { BackButton } from '@/components/back-button'
import { useAppStore } from '@/lib/store'
import { supportApi } from '@/lib/api/chat'
import type { SupportMsg } from '@/lib/api/chat'

export default function AdminSupportChatPage() {
  const user = useAppStore((s) => s.user)
  const [messages, setMessages] = useState<SupportMsg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  const loadMessages = useCallback(async () => {
    try {
      const msgs = await supportApi.getMessages()
      setMessages(msgs)
    } catch { /* ignore */ }
  }, [])

  // Init on mount
  useEffect(() => {
    if (!user) return
    const name = user.name || user.email || 'User'
    supportApi.init(name)
      .catch(() => {})
      .finally(() => {
        setInitialized(true)
        loadMessages().finally(() => setLoading(false))
      })
  }, [user, loadMessages])

  // Poll for admin replies every 5s
  useEffect(() => {
    if (!initialized) return
    const id = setInterval(loadMessages, 5_000)
    return () => clearInterval(id)
  }, [initialized, loadMessages])

  useEffect(() => { scrollToBottom() }, [messages])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    const text = input.trim()
    setInput('')
    try {
      const sent = await supportApi.send(text)
      setMessages((prev) => [...prev, sent])
    } catch {
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-xl px-4 py-3 border-b border-border flex items-center gap-3 sticky top-0 z-40">
        <BackButton fallbackUrl="/help" />
        <div className="w-10 h-10 rounded-full bg-[#703BF7] flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-foreground">SpaceButton Support</h2>
          <p className="text-xs text-green-500">We reply within minutes</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-[#703BF7]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-center">
            <MessageCircle className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Send us a message and we'll get back to you shortly.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'admin' && (
                <div className="w-8 h-8 rounded-full bg-[#703BF7] flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-auto">
                  S
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.sender === 'user'
                    ? 'bg-[#703BF7] text-white rounded-br-sm'
                    : 'bg-card border border-border text-foreground rounded-bl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-card/80 backdrop-blur-xl border-t border-border p-4 safe-area-pb">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-secondary border border-border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#703BF7]/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-full bg-[#703BF7] flex items-center justify-center hover:bg-[#5f32d4] disabled:opacity-50 disabled:hover:bg-[#703BF7] transition-colors flex-shrink-0"
          >
            {sending ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>
    </div>
  )
}
