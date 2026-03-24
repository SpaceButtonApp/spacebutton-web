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
    <div className="min-h-screen bg-[#0a0a0f] pb-24">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative bg-[#12121a]/80 backdrop-blur-xl px-4 py-4 sticky top-0 z-40 border-b border-gray-800/50">
        <h1 className="text-xl font-bold text-center text-white">Messages</h1>
      </div>

      {/* Conversations List */}
      <div className="relative px-4 py-4">
        {mockConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-2xl bg-[#12121a] border border-gray-800 flex items-center justify-center mb-4">
              <MessageCircle className="w-12 h-12 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No Messages</h2>
            <p className="text-gray-400 text-center">
              Start a conversation with property owners.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => router.push(`/chat/${conversation.user.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#12121a] border border-gray-800/50 hover:border-purple-500/30 transition-all duration-200"
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
                    <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-[#12121a]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-white truncate">{conversation.user.name}</h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatDistanceToNow(conversation.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate mt-1">
                    {conversation.lastMessage}
                  </p>
                </div>

                {/* Unread badge */}
                {conversation.unread > 0 && (
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                    <span className="text-xs text-white font-medium">
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
