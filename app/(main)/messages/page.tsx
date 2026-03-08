'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { MessageCircle } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { mockConversations } from '@/lib/mock-data'
import { formatDistanceToNow } from 'date-fns'

export default function MessagesPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-background px-4 py-4 sticky top-0 z-40 border-b border-border">
        <h1 className="text-xl font-bold text-center">Messages</h1>
      </div>

      {/* Conversations List */}
      <div className="px-4 py-4">
        {mockConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageCircle className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">No Messages</h2>
            <p className="text-muted-foreground text-center">
              Start a conversation with property owners.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => router.push(`/chat/${conversation.user.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              >
                {/* Avatar */}
                <div className="relative">
                  <Image
                    src={conversation.user.avatar}
                    alt={conversation.user.name}
                    width={56}
                    height={56}
                    className="rounded-full"
                  />
                  {conversation.user.online && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-success border-2 border-background" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold truncate">{conversation.user.name}</h3>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDistanceToNow(conversation.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {conversation.lastMessage}
                  </p>
                </div>

                {/* Unread badge */}
                {conversation.unread > 0 && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
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
