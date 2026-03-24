'use client'

import { useState, useRef, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { useAppStore } from '@/lib/store'
import { Search, Send, Phone, Video, MoreVertical, Paperclip, Image as ImageIcon, Smile, MessageSquare } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const userIdFromUrl = searchParams.get('user')
  
  const { supportChats, addSupportMessage } = useAppStore()
  const [selectedChatId, setSelectedChatId] = useState<string | null>(userIdFromUrl || (supportChats[0]?.userId || null))
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedChat = supportChats.find(c => c.userId === selectedChatId)

  const filteredChats = supportChats.filter(chat => 
    chat.userName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedChat?.messages])

  // Handle sending messages
  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return
    
    addSupportMessage(selectedChat.userId, selectedChat.userName, message.trim(), 'admin')
    setMessage('')
  }

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <AdminHeader title="Messages" />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Chat List */}
        <div className="w-80 border-r border-gray-800/50 bg-[#12121a] flex flex-col">
          <div className="p-4 border-b border-gray-800/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a24] border border-gray-800 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#703BF7]/50"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 ? (
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
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.userId)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-800/30 transition-colors ${
                    selectedChatId === chat.userId ? 'bg-[#703BF7]/10 border-l-2 border-[#703BF7]' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#703BF7] to-[#5f32d4] flex items-center justify-center text-white font-medium">
                      {chat.userName.charAt(0)}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#12121a] rounded-full" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white truncate">{chat.userName}</p>
                      <span className="text-xs text-gray-500">{chat.lastMessageTime}</span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <span className="w-5 h-5 bg-[#703BF7] rounded-full text-xs text-white flex items-center justify-center">
                      {chat.unread}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#0a0a0f]">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-800/50 flex items-center justify-between bg-[#12121a]">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#703BF7] to-[#5f32d4] flex items-center justify-center text-white font-medium">
                      {selectedChat.userName.charAt(0)}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#12121a] rounded-full" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{selectedChat.userName}</p>
                    <p className="text-xs text-gray-500">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedChat.messages.map((msg) => (
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
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-800/50 bg-[#12121a]">
                <div className="flex items-center gap-3">
                  <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="w-full px-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#703BF7]/50 pr-12"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors">
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                  <button 
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
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
                Select a conversation from the list to view messages, or wait for users to send support requests.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
