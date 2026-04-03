'use client'

import { useState, use, useEffect } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Video, Phone, MoreVertical, Send, X, CheckSquare, MessageSquare, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { BackButton } from '@/components/back-button'
import { Button } from '@/components/ui/button'
import { mockAgents, mockMessages } from '@/lib/mock-data'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyId = searchParams.get('propertyId')
  const { properties, doneDealStates, toggleDoneDeal, user, addReview, addConversation, conversations } = useAppStore()
  
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(mockMessages)
  const [showMenu, setShowMenu] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showDoneDealInfo, setShowDoneDealInfo] = useState(true)
  const [showCongrats, setShowCongrats] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  
  const agent = mockAgents.find((a) => a.id === id) || mockAgents[0]
  
  // Add this conversation to the messages list when chat is opened
  useEffect(() => {
    if (agent && propertyId) {
      // Check if conversation already exists
      const existingConversation = conversations.find(c => c.user.id === agent.id)
      if (!existingConversation) {
        addConversation({
          id: `conv-${agent.id}-${Date.now()}`,
          user: agent,
          lastMessage: 'Started conversation',
          timestamp: new Date(),
          unread: 0
        })
      }
    }
  }, [agent, propertyId, conversations, addConversation])
  
  // Get property details from propertyId param or find first property by this agent
  const property = propertyId 
    ? properties.find((p) => p.id === propertyId) 
    : properties.find((p) => p.agent?.id === id) || properties[0]

  // Create a unique chat ID for this conversation
  const chatId = `${id}-${propertyId || 'default'}`
  const doneDealState = doneDealStates[chatId] || { user: false, agent: false, locked: false }
  
  // Check if current user is the agent (property owner) or the interested user
  const isAgent = property?.ownerId === user?.id

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
    if (doneDealState.locked) return
    
    const bothAgreed = toggleDoneDeal(chatId, propertyId || property?.id || '', isAgent)
    if (bothAgreed) {
      setShowCongrats(true)
      setShowMenu(false)
    }
  }

  const handleSubmitFeedback = () => {
    if (rating > 0 && feedback.trim() && user) {
      // Add review for the agent/property owner
      addReview({
        fromUserId: user.id,
        fromUserName: user.name,
        fromUserAvatar: user.avatar,
        toUserId: agent.id,
        rating,
        feedback: feedback.trim()
      })
    }
    setShowFeedback(false)
    setShowMenu(false)
    setRating(0)
    setFeedback('')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-background px-4 py-3 border-b border-border flex items-center gap-3 sticky top-0 z-40">
        <BackButton fallbackUrl="/messages" />

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

      {/* Apartment Banner */}
      {property && property.images && property.images[0] && (
        <div className="px-4 py-2">
          <button
            onClick={() => router.push(`/property/${property.id}`)}
            className="w-full bg-secondary rounded-xl overflow-hidden border border-border hover:bg-secondary/80 transition-colors"
          >
            <div className="flex gap-3 p-3">
              <div className="relative flex-shrink-0">
                <Image
                  src={property.images[0]}
                  alt={property.title || 'Property'}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm line-clamp-1">{property.title}</p>
                <p className="text-muted-foreground text-xs mb-1">{property.location}</p>
                <p className="text-primary font-bold text-sm">₦{property.price.toLocaleString()}{property.rentPeriod ? `/${property.rentPeriod === 'monthly' ? 'month' : 'year'}` : ''}</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Menu Popup */}
      {showMenu && !showFeedback && (
        <div className="mx-4 mt-2 bg-background rounded-xl border border-border shadow-lg overflow-hidden z-50">
          <button
            onClick={() => setShowDoneDealInfo(true)}
            className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors border-b border-border"
          >
            <p className="text-sm text-muted-foreground">Learn about Done Deal</p>
          </button>
          <button
            onClick={handleDoneDeal}
            disabled={doneDealState.locked}
            className={cn(
              "w-full flex items-center justify-between px-4 py-4 transition-colors",
              doneDealState.locked 
                ? "bg-success/10 cursor-not-allowed" 
                : "hover:bg-secondary"
            )}
          >
            <div className="flex items-center gap-3">
              <CheckSquare className={cn("w-5 h-5", doneDealState.locked ? "text-success" : "text-muted-foreground")} />
              <div>
                <span className="font-medium">Done Deal</span>
                {doneDealState.locked && (
                  <p className="text-xs text-success">Deal completed!</p>
                )}
                {!doneDealState.locked && (doneDealState.user || doneDealState.agent) && (
                  <p className="text-xs text-muted-foreground">
                    Waiting for {doneDealState.user ? 'other party' : 'you'} to confirm
                  </p>
                )}
              </div>
            </div>
            <div className={cn(
              'w-6 h-6 rounded border-2 flex items-center justify-center transition-colors',
              doneDealState.locked 
                ? 'bg-success border-success' 
                : (isAgent ? doneDealState.agent : doneDealState.user) 
                  ? 'bg-primary border-primary' 
                  : 'border-muted-foreground'
            )}>
              {(doneDealState.locked || (isAgent ? doneDealState.agent : doneDealState.user)) && (
                <CheckSquare className={cn("w-4 h-4", doneDealState.locked ? "text-success-foreground" : "text-primary-foreground")} />
              )}
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

      {/* Congratulations Modal */}
      {showCongrats && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-background p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
            <p className="text-muted-foreground mb-6">
              Both parties have confirmed the deal. The property listing has been closed automatically.
            </p>
            <Button
              onClick={() => {
                setShowCongrats(false)
                router.push('/home')
              }}
              className="w-full rounded-xl bg-success hover:bg-success/90 text-success-foreground"
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {/* Done Deal Info Modal */}
      {showDoneDealInfo && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="w-full max-w-md rounded-t-3xl bg-background p-6 pb-8">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted" />
            
            <div className="space-y-4">
              <p className="font-semibold text-lg">How to use the Done Deal feature</p>
              
              <p className="text-muted-foreground text-sm">
                It's important for both parties to use the done deal button after successful transaction between both parties.
              </p>
              
              <div className="space-y-3 bg-secondary p-4 rounded-xl">
                <p className="font-medium text-sm">How to use the done deal button:</p>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground min-w-fit">1.</span>
                    <span>Click on the 3 dot sign on the top right corner</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground min-w-fit">2.</span>
                    <span>You will see a pop-up menu with Done Deal and Feedback options</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground min-w-fit">3.</span>
                    <span>Click on the Done Deal box after successful transaction</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground min-w-fit">4.</span>
                    <span>Click on Feedback to tell us about your experience and rate the user</span>
                  </li>
                </ol>
              </div>
            </div>

            <Button
              onClick={() => setShowDoneDealInfo(false)}
              className="w-full mt-6 rounded-xl"
            >
              Got it
            </Button>
          </div>
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
