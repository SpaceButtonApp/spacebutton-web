'use client'

import { useState, use } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Video, Phone, MoreVertical, Send, X, CheckSquare, MessageSquare, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { mockAgents, mockMessages } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(mockMessages)
  const [showMenu, setShowMenu] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [doneDeal, setDoneDeal] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  
  const agent = mockAgents.find((a) => a.id === id) || mockAgents[0]

  const handleSend = () => {
    if (!message.trim()) return
    
    const newMessage = {
      id: Date.now().toString(),
      senderId: 'current',
      receiverId: id,
      content: message,
      timestamp: new Date(),
      isOwn: true,
    }
    
    setMessages([...messages, newMessage])
    setMessage('')
  }

  const handleVideoCall = () => {
    router.push(`/call/video/${id}`)
  }

  const handleVoiceCall = () => {
    router.push(`/call/voice/${id}`)
  }

  const handleDoneDeal = () => {
    setDoneDeal(!doneDeal)
  }

  const handleSubmitFeedback = () => {
    setShowFeedback(false)
    setShowMenu(false)
    alert('Thank you for your feedback!')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-background px-4 py-3 border-b border-border flex items-center gap-3 sticky top-0 z-40">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button 
          onClick={() => router.push(`/profile/${agent.id}`)}
          className="flex items-center gap-3 flex-1"
        >
          <div className="relative">
            <Image
              src={agent.avatar}
              alt={agent.name}
              width={44}
              height={44}
              className="rounded-full"
            />
            {agent.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-background" />
            )}
          </div>
          <div className="text-left">
            <h2 className="font-semibold">{agent.name}</h2>
            <p className="text-xs text-success">{agent.online ? 'Online' : 'Offline'}</p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleVideoCall}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary"
          >
            <Video className="w-5 h-5" />
          </button>
          <button 
            onClick={handleVoiceCall}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Menu Popup */}
      {showMenu && !showFeedback && (
        <div className="mx-4 mt-2 bg-background rounded-xl border border-border shadow-lg overflow-hidden z-50">
          <button
            onClick={handleDoneDeal}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-3">
              <CheckSquare className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Done Deal</span>
            </div>
            <div className={cn(
              'w-6 h-6 rounded border-2 flex items-center justify-center transition-colors',
              doneDeal ? 'bg-primary border-primary' : 'border-muted-foreground'
            )}>
              {doneDeal && <CheckSquare className="w-4 h-4 text-primary-foreground" />}
            </div>
          </button>
          <div className="border-t border-border" />
          <button
            onClick={() => setShowFeedback(true)}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">FeedBack</span>
            </div>
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Feedback Form */}
      {showFeedback && (
        <div className="mx-4 mt-2 bg-background rounded-xl border border-border shadow-lg p-4 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Leave Feedback</h3>
            <button onClick={() => { setShowFeedback(false); setShowMenu(false); }}>
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Rate your experience</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star 
                    className={cn(
                      'w-8 h-8 transition-colors',
                      star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                    )} 
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Write your feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full h-24 p-3 rounded-xl border border-border bg-background resize-none text-sm"
          />

          <Button
            onClick={handleSubmitFeedback}
            className="w-full mt-4 h-12 rounded-xl bg-primary text-primary-foreground"
          >
            Submit Feedback
          </Button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 px-4 py-4 overflow-auto space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'max-w-[80%] p-4 rounded-2xl',
              msg.isOwn 
                ? 'ml-auto bg-foreground text-background rounded-br-sm' 
                : 'mr-auto bg-secondary text-foreground rounded-bl-sm border border-border'
            )}
          >
            <p className="text-sm leading-relaxed">{msg.content}</p>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-background border-t border-border">
        <div className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="Message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 h-12 rounded-full border-border bg-secondary px-4"
          />
          <button
            onClick={handleSend}
            className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center"
          >
            <Send className="w-5 h-5 text-background" />
          </button>
        </div>
      </div>
    </div>
  )
}
