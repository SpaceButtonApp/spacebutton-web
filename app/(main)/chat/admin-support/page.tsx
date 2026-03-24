'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Video, Phone, MoreVertical, Send, Paperclip, Smile } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { BackButton } from '@/components/back-button'
import { useAppStore } from '@/lib/store'

interface Message {
  id: string
  text: string
  sender: 'user' | 'admin'
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: '1',
    text: 'Hello! Welcome to SpaceButton Support. How can I help you today?',
    sender: 'admin',
    timestamp: new Date(Date.now() - 60000),
  },
]

export default function AdminSupportChatPage() {
  const router = useRouter()
  const { user, addNotification } = useAppStore()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setNewMessage('')

    // Send notification to admin
    addNotification({
      id: `support-${Date.now()}`,
      title: 'New Support Message',
      message: `${user?.firstName || 'User'}: ${newMessage}`,
      type: 'general',
      read: false,
      createdAt: new Date().toISOString(),
    })

    // Simulate admin response after delay
    setTimeout(() => {
      const adminResponses = [
        "Thank you for reaching out! I'm looking into your query now.",
        "I understand your concern. Let me check this for you.",
        "Thanks for your patience. Is there anything specific I can help you with?",
        "I've noted your request. Our team will get back to you shortly.",
        "That's a great question! Here's what I can tell you...",
      ]
      
      const randomResponse = adminResponses[Math.floor(Math.random() * adminResponses.length)]
      
      const adminMsg: Message = {
        id: `admin-${Date.now()}`,
        text: randomResponse,
        sender: 'admin',
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, adminMsg])
    }, 1500)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-xl px-4 py-3 border-b border-border flex items-center gap-3 sticky top-0 z-40">
        <BackButton fallbackUrl="/help" />
        
        <div className="w-12 h-12 rounded-full overflow-hidden relative flex-shrink-0 border-2 border-[#703BF7]">
          <Image
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face"
            alt="Support"
            fill
            className="object-cover"
          />
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
        </div>
        
        <div className="flex-1">
          <h2 className="font-semibold text-foreground">SpaceButton Support</h2>
          <p className="text-xs text-green-500">Online</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors">
            <Phone className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors">
            <Video className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors">
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'admin' && (
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 mt-auto">
                <Image
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face"
                  alt="Support"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                message.sender === 'user'
                  ? 'bg-[#703BF7] text-white rounded-br-sm'
                  : 'bg-card border border-border text-foreground rounded-bl-sm'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'}`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-card/80 backdrop-blur-xl border-t border-border p-4 safe-area-pb">
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors">
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="pr-10 bg-secondary border-border rounded-full"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2">
              <Smile className="w-5 h-5 text-muted-foreground hover:text-[#703BF7] transition-colors" />
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="w-10 h-10 rounded-full bg-[#703BF7] flex items-center justify-center hover:bg-[#5f32d4] disabled:opacity-50 disabled:hover:bg-[#703BF7] transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
