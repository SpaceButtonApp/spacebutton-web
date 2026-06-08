'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { adminApi } from '@/lib/api/admin'
import type { SupportChat, SupportMessage } from '@/lib/api/admin'
import { Search, Send, MessageSquare, RefreshCw } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const userIdFromUrl = searchParams.get('user')

  const [chats, setChats] = useState<SupportChat[]>([])
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(userIdFromUrl)
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingChats, setLoadingChats] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedChat = chats.find(c => c.user_id === selectedUserId)

  const loadChats = useCallback(async () => {
    try {
      const data = await adminApi.getSupportChats()
      setChats(data)
      if (!selectedUserId && data.length > 0 && !userIdFromUrl) {
        setSelectedUserId(data[0].user_id)
      }
    } catch { /* ignore */ }
    finally { setLoadingChats(false) }
  }, [selectedUserId, userIdFromUrl])

  const loadMessages = useCallback(async (userId: string) => {
    setLoadingMessages(true)
    try {
      const data = await adminApi.getSupportMessages(userId)
      setMessages(data)
    } catch { /* ignore */ }
    finally { setLoadingMessages(false) }
  }, [])

  // Initial load + poll chats every 30s
  useEffect(() => {
    loadChats()
    const interval = setInterval(loadChats, 30_000)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load + poll messages when chat selected (every 5s)
  useEffect(() => {
    if (!selectedUserId) return
    loadMessages(selectedUserId)
    const interval = setInterval(() => loadMessages(selectedUserId), 5_000)
    return () => clearInterval(interval)
  }, [selectedUserId, loadMessages])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!message.trim() || !selectedUserId || sending) return
    setSending(true)
    try {
      const sent = await adminApi.replyToUser(selectedUserId, message.trim())
      setMessages(prev => [...prev, sent])
      setMessage('')
      // Update last message in chat list
      setChats(prev => prev.map(c =>
        c.user_id === selectedUserId
          ? { ...c, last_message: sent.text, last_message_time: sent.timestamp, unread: 0 }
          : c
      ))
    } catch { /* ignore */ }
    finally { setSending(false) }
  }

  const handleSelectChat = (userId: string) => {
    setSelectedUserId(userId)
    setChats(prev => prev.map(c => c.user_id === userId ? { ...c, unread: 0 } : c))
  }

  const filteredChats = chats.filter(c =>
    c.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const formatDate = (ts: string) => {
    const d = new Date(ts)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return formatTime(ts)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <AdminHeader title="Support Messages" />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Chat List */}
        <div className="w-80 border-r border-gray-800/50 bg-[#12121a] flex flex-col">
          <div className="p-4 border-b border-gray-800/50 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a24] border border-gray-800 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#703BF7]/50"
              />
            </div>
            <button onClick={loadChats} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingChats ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-[#703BF7]/30 border-t-[#703BF7] rounded-full animate-spin" />
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-16 h-16 rounded-full bg-[#703BF7]/20 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-[#703BF7]" />
                </div>
                <p className="text-gray-400 text-sm">No support conversations yet</p>
                <p className="text-gray-500 text-xs mt-1">Messages from users will appear here</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <button
                  key={chat.user_id}
                  onClick={() => handleSelectChat(chat.user_id)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-800/30 transition-colors ${
                    selectedUserId === chat.user_id ? 'bg-[#703BF7]/10 border-l-2 border-[#703BF7]' : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#703BF7] to-[#5f32d4] flex items-center justify-center text-white font-medium text-lg">
                      {chat.user_name.charAt(0).toUpperCase()}
                    </div>
                    {chat.unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#703BF7] rounded-full text-xs text-white flex items-center justify-center font-bold">
                        {chat.unread > 9 ? '9+' : chat.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-medium text-white truncate text-sm">{chat.user_name}</p>
                      <span className="text-xs text-gray-500 shrink-0 ml-2">{formatDate(chat.last_message_time)}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{chat.last_message}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#0a0a0f]">
          {selectedChat ? (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-800/50 flex items-center justify-between bg-[#12121a]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#703BF7] to-[#5f32d4] flex items-center justify-center text-white font-medium">
                    {selectedChat.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white">{selectedChat.user_name}</p>
                    <p className="text-xs text-gray-500">Support conversation</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-6 h-6 border-2 border-[#703BF7]/30 border-t-[#703BF7] rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-gray-500 text-sm">No messages yet</div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                        msg.sender === 'admin'
                          ? 'bg-[#703BF7] text-white rounded-br-none'
                          : 'bg-[#1a1a24] text-white rounded-bl-none'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 'admin' ? 'text-purple-200' : 'text-gray-500'}`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-800/50 bg-[#12121a]">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder="Type a reply..."
                    className="flex-1 px-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#703BF7]/50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || sending}
                    className="p-3 rounded-xl bg-[#703BF7] hover:bg-[#5f32d4] disabled:bg-gray-700 disabled:cursor-not-allowed text-white transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-20 h-20 rounded-full bg-[#703BF7]/20 flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-[#703BF7]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No conversation selected</h3>
              <p className="text-gray-400 text-sm max-w-sm">
                Select a conversation from the list to view and reply to messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
