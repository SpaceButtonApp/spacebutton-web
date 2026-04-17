'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { MessageCircle } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { useAppStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'

export default function MessagesPage() {
  const router = useRouter()
  const { conversations } = useAppStore()

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-xl px-4 py-4 sticky top-0 z-40 border-b border-border">
        <h1 className="text-xl font-bold text-center text-foreground">Messages</h1>
      </div>

      {/* Conversations List */}
      <div className="px-4 py-4">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4">
              <MessageCircle className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No Messages</h2>
            <p className="text-muted-foreground text-center">
              Start a conversation with property owners.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => router.push(`/chat/${conversation.user.id}?propertyId=${conversation.propertyId}`)}
                className="w-full flex gap-3 p-3 rounded-xl bg-secondary border border-border hover:border-primary/30 transition-all duration-200"
              >
                {/* Property Image */}
                <div className="relative flex-shrink-0">
                  <Image
                    src={conversation.property.images?.[0] || '/placeholder.png'}
                    alt={conversation.property.title}
                    width={64}
                    height={64}
                    className="rounded-lg object-cover w-16 h-16"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-foreground truncate">{conversation.property.title}</h3>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDistanceToNow(conversation.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">with {conversation.user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                </div>

                {/* Unread badge */}
                {conversation.unread > 0 && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                    <span className="text-xs text-primary-foreground font-medium">
                      {conversation.unread}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
