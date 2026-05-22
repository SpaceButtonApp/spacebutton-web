'use client'

import { useState, use, useEffect } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Video, Phone, MoreVertical, Send, X, Check, CheckSquare, MessageSquare, Star, Flag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { BackButton } from '@/components/back-button'
import { Button } from '@/components/ui/button'
import { mockAgents } from '@/lib/mock-data'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ccircle cx="50" cy="35" r="15" fill="%239ca3af"/%3E%3Cpath d="M 20 80 Q 50 60 80 80" fill="%239ca3af"/%3E%3C/svg%3E'
const DEFAULT_PROPERTY = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Cpath d="M 50 20 L 80 45 L 75 45 L 75 75 L 25 75 L 25 45 L 20 45 Z" fill="%239ca3af"/%3E%3C/svg%3E'

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyId = searchParams.get('propertyId')
  const { properties, doneDealStates, toggleDoneDeal, user, addReview, addConversation, conversations, addReport, closedProperties, reviews, registeredUsers, closeProperty, removeConversation } = useAppStore()
  
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{
    id: string
    senderId: string
    receiverId: string
    content: string
    timestamp: Date
    isOwn: boolean
  }>>([])
  const [showMenu, setShowMenu] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showDoneDealInfo, setShowDoneDealInfo] = useState(true)
  const [showCongrats, setShowCongrats] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [showProfileCard, setShowProfileCard] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedReportReason, setSelectedReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  
  // Get property details - safely with fallbacks
  const property = propertyId && properties.length > 0
    ? properties.find((p) => p && p.id === propertyId)
    : properties.length > 0 
      ? properties.find((p) => p && p.agent && p.agent.id === id) || properties[0]
      : null
  
  // Get agent - always has a fallback
  const baseAgent = property?.agent || mockAgents.find((a) => a && a.id === id) || mockAgents[0]
  
  // Try to get actual registered user data for the agent (for accurate profile picture/name)
  const registeredAgent = registeredUsers.find((u) => u.userId === baseAgent?.id || u.id === baseAgent?.id)
  
  // Merge agent data with registered user data if available (registered user data takes priority)
  const agent = {
    ...baseAgent,
    name: registeredAgent?.name || baseAgent?.name,
    avatar: registeredAgent?.avatar || baseAgent?.avatar,
    type: registeredAgent?.type || baseAgent?.type,
  }
  
  // Calculate agent stats dynamically (same logic as profile page)
  const agentListings = properties.filter((p) => 
    (p.ownerId === agent?.id || p.agent?.id === agent?.id) && !closedProperties.includes(p.id)
  ).length
  const agentClosedDeals = properties.filter((p) => 
    (p.ownerId === agent?.id || p.agent?.id === agent?.id) && closedProperties.includes(p.id)
  ).length
  const agentReviews = reviews.filter((r) => r.toUserId === agent?.id)
  const agentRating = agentReviews.length > 0 
    ? (agentReviews.reduce((sum, r) => sum + r.rating, 0) / agentReviews.length).toFixed(1)
    : '0.0'
  
  // Check if user has already submitted feedback for this agent
  const hasSubmittedFeedback = reviews.some((r) => r.fromUserId === user?.id && r.toUserId === agent?.id)
  
  // Show fallback if property not found
  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Chat not available</h1>
          <p className="text-muted-foreground mb-6">The property or conversation could not be found.</p>
          <button
            onClick={() => router.push('/messages')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Back to Messages
          </button>
        </div>
      </div>
    )
  }
  
  // Add this conversation to the messages list when chat is opened
  useEffect(() => {
    if (agent && property && propertyId && properties.length > 0) {
      // Check if this exact conversation already exists (same property + same user)
      const existingConversation = conversations?.find(
        c => c && c.propertyId === propertyId && c.user && c.user.id === agent.id
      )
      
      // Only add if not already in list
      if (!existingConversation) {
        try {
          const newConversation = {
            id: `conv-${propertyId}-${agent.id}-${Date.now()}`,
            user: agent,
            property: property,
            propertyId: propertyId,
            lastMessage: 'Started conversation',
            timestamp: new Date(),
            unread: 0
          }
          addConversation(newConversation)
        } catch (error) {
          console.error('[v0] Error adding conversation:', error)
        }
      }
    }
  }, [propertyId, agent, property, properties.length, conversations, addConversation])

  // Create a unique chat ID for this conversation
  const chatId = `${id}-${propertyId || 'default'}`
  const doneDealState = doneDealStates ? doneDealStates[chatId] || { user: false, agent: false, locked: false } : { user: false, agent: false, locked: false }
  
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
    
    try {
      const bothAgreed = toggleDoneDeal(chatId, propertyId || property?.id || '', isAgent)
      if (bothAgreed) {
        // Close the property and remove the conversation
        if (propertyId) {
          closeProperty(propertyId)
          removeConversation(propertyId)
        }
        setShowCongrats(true)
        setShowMenu(false)
      }
    } catch (error) {
      console.error('[v0] Error toggling done deal:', error)
    }
  }

  const handleSubmitFeedback = () => {
    if (rating > 0 && feedback.trim() && user) {
      try {
        addReview({
          fromUserId: user.id,
          fromUserName: user.name,
          fromUserAvatar: user.avatar,
          toUserId: agent.id,
          rating,
          feedback: feedback.trim()
        })
      } catch (error) {
        console.error('[v0] Error submitting feedback:', error)
      }
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
              src={agent?.avatar || DEFAULT_AVATAR}
              alt={agent?.name || 'User'}
              width={44}
              height={44}
              className="rounded-full object-cover"
              unoptimized
              onError={() => {}}
            />
            {agent?.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-background" />
            )}
          </div>
          <div className="text-left">
            <h2 className="font-semibold">{agent?.name || 'User'}</h2>
            <p className="text-xs text-success">{agent?.online ? 'Online' : 'Offline'}</p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleVoiceCall}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button 
            onClick={handleVideoCall}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Video className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Property Banner */}
      {property && (
        <div className="px-4 py-2">
          <button
            onClick={() => router.push(`/property/${property.id}`)}
            className="w-full bg-secondary rounded-xl overflow-hidden border border-border hover:bg-secondary/80 transition-colors"
          >
            <div className="flex gap-3 p-3">
              <div className="relative flex-shrink-0 w-20 h-20">
                <Image
                  src={property?.images?.[0] || DEFAULT_PROPERTY}
                  alt={property?.title || 'Property'}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover w-full h-full"
                  unoptimized
                  onError={() => {}}
                />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-semibold text-sm line-clamp-1">{property?.title || 'Property'}</p>
                <p className="text-muted-foreground text-xs mb-1">{property?.location || 'Location'}</p>
                <p className="text-primary font-bold text-sm">₦{property?.price ? property.price.toLocaleString() : 'N/A'}{property?.rentPeriod ? `/${property.rentPeriod === 'monthly' ? 'month' : 'year'}` : ''}</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Menu Popup */}
      {showMenu && !showFeedback && !showReportModal && (
        <div className="mx-4 mt-2 bg-background rounded-xl border border-border shadow-lg overflow-hidden z-50">
          <button
            onClick={() => { setShowProfileCard(true); setShowMenu(false); }}
            className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors border-b border-border flex items-center gap-3"
          >
            <span className="font-medium">View Profile</span>
          </button>
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
              "w-full flex items-center justify-between px-4 py-4 transition-colors border-b border-border",
              doneDealState.locked 
                ? "bg-success/10 cursor-not-allowed" 
                : "hover:bg-secondary"
            )}
          >
            <div className="flex items-center gap-3">
              {/* Checkbox */}
              <div className={cn(
                "w-6 h-6 rounded border-2 flex items-center justify-center transition-colors",
                doneDealState.locked 
                  ? "bg-success border-success" 
                  : (isAgent ? doneDealState.agent : doneDealState.user)
                    ? "bg-primary border-primary" 
                    : "border-muted-foreground"
              )}>
                {((isAgent ? doneDealState.agent : doneDealState.user) || doneDealState.locked) && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>
              <div>
                <span className="font-medium">Done Deal</span>
                {(isAgent ? doneDealState.agent : doneDealState.user) && !doneDealState.locked && (
                  <p className="text-xs text-primary">Waiting for other user...</p>
                )}
                {doneDealState.locked && (
                  <p className="text-xs text-success">Deal completed!</p>
                )}
              </div>
            </div>
          </button>
          {!hasSubmittedFeedback && (
            <button
              onClick={() => setShowFeedback(true)}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary transition-colors border-b border-border"
            >
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Feedback</span>
            </button>
          )}
          {hasSubmittedFeedback && (
            <div className="w-full flex items-center gap-3 px-4 py-4 bg-secondary/50 border-b border-border cursor-not-allowed">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">Feedback Submitted</span>
            </div>
          )}
          <button
            onClick={() => { setShowReportModal(true); setShowMenu(false); }}
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary transition-colors text-destructive"
          >
            <Flag className="w-5 h-5" />
            <span className="font-medium">Report User</span>
          </button>
        </div>
      )}

      {/* Profile Card Modal */}
      {showProfileCard && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="w-full max-w-md rounded-t-3xl bg-background p-6 pb-8 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">User Profile</h3>
              <button onClick={() => setShowProfileCard(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <Image
                  src={agent?.avatar || DEFAULT_AVATAR}
                  alt={agent?.name || 'User'}
                  width={120}
                  height={120}
                  className="rounded-full mb-4 border-4 border-primary object-cover"
                  unoptimized
                  onError={() => {}}
                />
                <h2 className="text-2xl font-bold">{agent?.name || 'User'}</h2>
                <p className="text-muted-foreground capitalize mt-1">
                  {agent?.type === 'agent' ? 'Agent' : 'Individual'}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{agentListings}</p>
                  <p className="text-xs text-muted-foreground">Listings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{agentClosedDeals}</p>
                  <p className="text-xs text-muted-foreground">Closed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                    {agentRating}
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>

              {/* Current Property */}
              {property && (
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-2">Current Property</p>
                  <div className="flex gap-3">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={property?.images?.[0] || DEFAULT_PROPERTY}
                        alt={property?.title || 'Property'}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover w-full h-full"
                        unoptimized
                        onError={() => {}}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-1">{property?.title || 'Property'}</p>
                      <p className="text-xs text-muted-foreground">{property?.location || 'Location'}</p>
                      <p className="text-primary font-bold text-sm mt-1">₦{property?.price ? property.price.toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Gender */}
              {agent?.gender && (
                <div>
                  <p className="text-sm text-muted-foreground">Gender: <span className="text-foreground font-medium">{agent.gender}</span></p>
                </div>
              )}

              {/* About */}
              {agent?.bio && (
                <div>
                  <p className="text-sm font-medium mb-2">About</p>
                  <p className="text-sm text-muted-foreground">{agent.bio}</p>
                </div>
              )}

              {/* Location */}
              {(agent?.state || agent?.city) && (
                <div>
                  <p className="text-sm text-muted-foreground">Location: <span className="text-foreground font-medium">{[agent?.city, agent?.state].filter(Boolean).join(', ')}</span></p>
                </div>
              )}

              {/* Reviews */}
              <div>
                <p className="text-sm font-medium mb-3">Reviews ({agentReviews.length})</p>
                {agentReviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No reviews yet.</p>
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {agentReviews.map((review) => (
                      <div key={review.id} className="p-3 bg-secondary rounded-xl">
                        <div className="flex items-start gap-2">
                          <Image
                            src={review.fromUserAvatar}
                            alt={review.fromUserName}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate">{review.fromUserName}</p>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star}
                                    className={cn(
                                      'w-3 h-3',
                                      star <= review.rating 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-muted-foreground'
                                    )} 
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{review.feedback}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowProfileCard(false)}
                className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-background p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Flag className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-bold text-lg">Flag This User</h3>
              </div>
              <button onClick={() => setShowReportModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Help us maintain a safe community by reporting concerning behavior.
            </p>

            {/* Report Reasons */}
            <div className="space-y-3 mb-6">
              {[
                { id: 'scam', label: 'Scam or Fraud', desc: 'Suspicious activity' },
                { id: 'harassment', label: 'Harassment', desc: 'Inappropriate behavior' },
                { id: 'fake', label: 'Fake Content', desc: 'False information' },
                { id: 'other', label: 'Other', desc: 'Something else' }
              ].map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReportReason(reason.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border-2 transition-all",
                    selectedReportReason === reason.id
                      ? 'border-destructive bg-destructive/5'
                      : 'border-border hover:border-destructive/30'
                  )}
                >
                  <p className="font-medium text-sm">{reason.label}</p>
                  <p className="text-xs text-muted-foreground">{reason.desc}</p>
                </button>
              ))}
            </div>

            {/* Other reason text input */}
            {selectedReportReason === 'other' && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Please specify your reason</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Describe why you are reporting this user..."
                  className="w-full h-24 px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-destructive/50"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (!selectedReportReason) {
                    return
                  }
                  // Require details if "other" is selected
                  if (selectedReportReason === 'other' && !reportDetails.trim()) {
                    return
                  }
                  try {
                    addReport({
                      reportedUserId: agent.id,
                      reportedUserName: agent.name,
                      reporterId: user?.id || 'anonymous',
                      reporterName: user?.name || 'Anonymous User',
                      reason: selectedReportReason as 'scam' | 'harassment' | 'fake' | 'other',
                      details: reportDetails,
                      reportedAt: new Date().toISOString(),
                      status: 'pending'
                    })
                    // Show success feedback
                    alert('Report submitted successfully. Our team will review it shortly.')
                    setShowReportModal(false)
                    setSelectedReportReason('')
                    setReportDetails('')
                  } catch (error) {
                    console.error('[v0] Error submitting report:', error)
                    alert('Failed to submit report. Please try again.')
                  }
                }}
                disabled={!selectedReportReason || (selectedReportReason === 'other' && !reportDetails.trim())}
                className={cn(
                  "w-full h-12 rounded-lg font-medium transition-colors",
                  selectedReportReason && !(selectedReportReason === 'other' && !reportDetails.trim())
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    : 'bg-secondary text-muted-foreground cursor-not-allowed'
                )}
              >
                Submit Report
              </button>
              <button
                onClick={() => {
                  setShowReportModal(false)
                  setSelectedReportReason('')
                  setReportDetails('')
                }}
                className="w-full h-12 rounded-lg border border-border font-medium hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
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
              Both parties have confirmed the deal. The property has been closed and this chat has been archived.
            </p>
            <Button
              onClick={() => {
                setShowCongrats(false)
                router.push('/messages')
              }}
              className="w-full rounded-xl bg-success hover:bg-success/90 text-success-foreground"
            >
              Back to Messages
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
              <p className="font-semibold text-lg">How to use Done Deal</p>
              
              <p className="text-muted-foreground text-sm">
                Use this feature after a successful transaction between both parties.
              </p>
              
              <div className="space-y-3 bg-secondary p-4 rounded-xl">
                <p className="font-medium text-sm">Steps:</p>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground">1.</span>
                    <span>Click the 3-dot menu at the top right</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground">2.</span>
                    <span>Select &quot;Done Deal&quot; after successful transaction</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground">3.</span>
                    <span>Wait for the other party to also confirm</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-foreground">4.</span>
                    <span>Once both parties confirm, the deal is complete!</span>
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
            className="w-full mt-4 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Submit Feedback
          </Button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 px-4 py-4 overflow-auto space-y-3">
        {messages && messages.length > 0 ? (
          messages.map((msg) => (
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
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        )}
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
            className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center hover:bg-foreground/90 transition-colors"
          >
            <Send className="w-5 h-5 text-background" />
          </button>
        </div>
      </div>
    </div>
  )
}
