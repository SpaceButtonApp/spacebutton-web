'use client'

export const dynamic = 'force-dynamic'

import { useState, use, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Send, ArrowLeft, Building2, User, MapPin, MessageCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { AdminHeader } from '@/components/admin/header'
import { useAppStore } from '@/lib/store'

function AdminUserChatPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyId = searchParams.get('propertyId')
  const { properties, registeredUsers } = useAppStore()
  
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{
    id: string
    senderId: string
    content: string
    timestamp: Date
    isOwn: boolean
  }>>([])
  
  // Find the user who posted the property
  const propertyOwner = registeredUsers.find(u => u.id === userId)
  const property = propertyId ? properties.find(p => p.id === propertyId) : null

  const handleSend = () => {
    if (!message.trim()) return
    
    const newMessage = {
      id: Date.now().toString(),
      senderId: 'admin',
      content: message,
      timestamp: new Date(),
      isOwn: true,
    }
    
    setMessages([...messages, newMessage])
    setMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <AdminHeader title="Chat with User" />
      
      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* User Info Header */}
        <div className="bg-[#12121a] border-b border-gray-800/50 px-6 py-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#703BF7] to-[#5f32d4] flex items-center justify-center">
              {propertyOwner?.avatar ? (
                <Image
                  src={propertyOwner.avatar}
                  alt={propertyOwner.name || 'User'}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-white text-lg">
                {propertyOwner?.name || `User ${userId}`}
              </h2>
              <p className="text-gray-400 text-sm">
                {propertyOwner?.email || 'Property Owner'}
              </p>
            </div>
          </div>
        </div>

        {/* Property Context Card */}
        {property && (
          <div className="mx-6 mt-4">
            <div className="bg-[#1a1a24] border border-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                <Building2 className="w-3.5 h-3.5" />
                <span>Chatting about this property</span>
              </div>
              <div className="flex gap-3">
                {property.images?.[0] && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{property.title}</h3>
                  <p className="text-gray-400 text-sm flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    {property.location}
                  </p>
                  <p className="text-[#703BF7] font-semibold mt-1">
                    N{property.price?.toLocaleString()}
                    {property.rentPeriod ? `/${property.rentPeriod === 'monthly' ? 'mo' : 'yr'}` : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#703BF7]/10 flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-[#703BF7]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Start a Conversation</h3>
              <p className="text-gray-400 text-sm max-w-xs">
                Send a message to the property owner to start the conversation.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.isOwn
                      ? 'bg-[#703BF7] text-white rounded-br-sm'
                      : 'bg-[#1a1a24] text-white rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.isOwn ? 'text-white/60' : 'text-gray-500'}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="bg-[#12121a] border-t border-gray-800/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 h-12 bg-[#1a1a24] border-gray-800 text-white rounded-xl placeholder:text-gray-500"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="w-12 h-12 rounded-xl bg-[#703BF7] hover:bg-[#5f32d4] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminUserChatPageWrapper({ params }: { params: Promise<{ userId: string }> }) {
  return <Suspense><AdminUserChatPage params={params} /></Suspense>
}
