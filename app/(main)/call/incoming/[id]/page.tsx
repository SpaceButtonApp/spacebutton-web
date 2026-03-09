'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, Phone, PhoneOff } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { mockConversations } from '@/lib/mock-data'

export default function IncomingCallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const conversation = mockConversations.find((c) => c.id === id)

  const handleAccept = () => {
    router.push(`/call/voice/${id}`)
  }

  const handleDecline = () => {
    router.back()
  }

  if (!conversation) {
    return <div>Conversation not found</div>
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-4 p-4">
        <button
          onClick={() => router.back()}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-muted"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-1 text-center text-xl font-semibold">Ringing ...</h1>
        <div className="w-12" />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="relative mb-6 h-48 w-48">
          <Image
            src={conversation.avatar}
            alt={conversation.name}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <h2 className="text-2xl font-semibold">{conversation.name}</h2>
      </div>

      <div className="flex items-center justify-center gap-12 px-4 pb-32">
        <button
          onClick={handleDecline}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg"
        >
          <PhoneOff className="h-7 w-7" />
        </button>
        <button
          onClick={handleAccept}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lg"
        >
          <Phone className="h-7 w-7" />
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
