'use client'

import { useState, useRef, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { useAppStore } from '@/lib/store'
import { Search, Send, Phone, Video, MoreVertical, Paperclip, Image as ImageIcon, Smile } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

// Mock messages for demo
const initialMockChats = [
  { id: '1', name: 'John Doe', lastMessage: 'Thanks for your help!', time: '2m ago', unread: 2, online: true },
  { id: '2', name: 'Jane Smith', lastMessage: 'I have a question about the listing', time: '15m ago', unread: 0, online: true },
  { id: '3', name: 'Mike Johnson', lastMessage: 'The property looks great', time: '1h ago', unread: 1, online: false },
  { id: '4', name: 'Sarah Williams', lastMessage: 'When can we schedule a viewing?', time: '3h ago', unread: 0, online: false },
  { id: '5', name: 'David Brown', lastMessage: 'Interested in the apartment', time: '5h ago', unread: 0, online: true },
]

interface Message {
  id: string
  sender: 'user' | 'admin'
  text: string
  time: string
}

const initialMockMessages: Message[] = [
  { id: '1', sender: 'user', text: 'Hello, I have a question about a listing', time: '10:30 AM' },
  { id: '2', sender: 'admin', text: 'Hi! Sure, how can I help you today?', time: '10:32 AM' },
  { id: '3', sender: 'user', text: 'I saw a property on Ogunlana Drive. Is it still available?', time: '10:33 AM' },
  { id: '4', sender: 'admin', text: 'Yes, that property is still available. Would you like to schedule a viewing?', time: '10:35 AM' },
  { id: '5', sender: 'user', text: 'That would be great! Thanks for your help!', time: '10:36 AM' },
]

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const userIdFromUrl = searchParams.get('user')
  
  const [mockChats, setMockChats] = useState(initialMockChats)
  const [selectedChat, setSelectedChat] = useState(
    userIdFromUrl ? mockChats.find(c => c.id === userIdFromUrl) || mockChats[0] : mockChats[0]
  )
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>(initialMockMessages)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredChats = mockChats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle sending messages
  const handleSendMessage = () => {
    if (!message.trim()) return
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'admin',
      text: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    setMessages(prev => [...prev, newMessage])
    setMessage('')
    setShowEmojiPicker(false)
    
    // Update last message in chat list
    setMockChats(prev => prev.map(chat => 
      chat.id === selectedChat.id 
        ? { ...chat, lastMessage: message.trim(), time: 'Just now' }
        : chat
    ))
  }

  // Handle emoji selection
  const handleEmojiSelect = (emoji: any) => {
    setMessage(prev => prev + emoji.native)
    inputRef.current?.focus()
  }

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen">
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
                className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a24] border border-gray-800 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-800/30 transition-colors ${
                  selectedChat.id === chat.id ? 'bg-purple-500/10 border-l-2 border-purple-500' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium">
                    {chat.name.charAt(0)}
                  </div>
                  {chat.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#12121a] rounded-full" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white truncate">{chat.name}</p>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <span className="w-5 h-5 bg-purple-600 rounded-full text-xs text-white flex items-center justify-center">
                    {chat.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#0a0a0f]">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-gray-800/50 flex items-center justify-between bg-[#12121a]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium">
                  {selectedChat.name.charAt(0)}
                </div>
                {selectedChat.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#12121a] rounded-full" />
                )}
              </div>
              <div>
                <p className="font-medium text-white">{selectedChat.name}</p>
                <p className="text-xs text-gray-500">{selectedChat.online ? 'Online' : 'Offline'}</p>
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
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                  msg.sender === 'admin' 
                    ? 'bg-purple-600 text-white rounded-br-none' 
                    : 'bg-[#1a1a24] text-white rounded-bl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'admin' ? 'text-purple-200' : 'text-gray-500'}`}>{msg.time}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-800/50 bg-[#12121a] relative">
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full left-4 mb-2">
                <Picker 
                  data={data} 
                  onEmojiSelect={handleEmojiSelect}
                  theme="dark"
                  previewPosition="none"
                  skinTonePosition="none"
                />
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                <ImageIcon className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 bg-[#1a1a24] border border-gray-800 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 pr-12"
                />
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <Smile className="w-5 h-5" />
                </button>
              </div>
              <button 
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
