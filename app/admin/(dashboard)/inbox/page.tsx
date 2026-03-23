'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  Plus, 
  Search, 
  Phone, 
  Video,
  MoreVertical,
  Smile,
  Send,
  Paperclip
} from 'lucide-react'
import { Input } from '@/components/ui/input'

const mockConversations = [
  { id: 1, name: 'Shelby Goode', message: 'Lorem Ipsum is simply dummy text of the printing', time: '1 min ago', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', unread: false },
  { id: 2, name: 'Robert Bacins', message: 'Lorem Ipsum is simply dummy text of the printing', time: '9 min ago', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', unread: false },
  { id: 3, name: 'John Carilo', message: 'Lorem Ipsum is simply dummy text of the printing', time: '15 min ago', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', unread: true },
  { id: 4, name: 'Adriene Watson', message: 'Lorem Ipsum is simply dummy text of the printing', time: '21 min ago', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', unread: false },
  { id: 5, name: 'Jhon Deo', message: 'Lorem Ipsum is simply dummy text of the printing', time: '29 min ago', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', unread: false },
  { id: 6, name: 'Mark Ruffalo', message: 'Lorem Ipsum is simply dummy text of the printing', time: '45 min ago', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop', unread: false },
  { id: 7, name: 'Mark Ruffalo', message: 'Lorem Ipsum is simply dummy text of the printing', time: '50 min ago', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop', unread: true },
  { id: 8, name: 'Mark Ruffalo', message: 'Lorem Ipsum is simply dummy text of the printing', time: '55 min ago', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop', unread: true },
]

const mockMessages = [
  { id: 1, sender: 'other', text: 'Lorem Ipsum is simply', time: '09:02 PM' },
  { id: 2, sender: 'other', text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', time: '09:02 PM' },
  { id: 3, sender: 'me', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', time: '09:03 PM' },
  { id: 4, sender: 'me', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', time: '09:03 PM' },
  { id: 5, sender: 'other', text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', time: '09:04 PM' },
  { id: 6, sender: 'other', text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', time: '09:04 PM' },
]

export default function InboxPage() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[2])
  const [activeTab, setActiveTab] = useState<'all' | 'personal' | 'teams'>('personal')
  const [message, setMessage] = useState('')

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-card rounded-2xl border border-border overflow-hidden">
      {/* Conversations List */}
      <div className="w-96 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Message</h2>
            <button className="p-2 bg-primary text-primary-foreground rounded-full">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Search"
              className="h-10 pl-4 pr-10 rounded-lg bg-secondary border-0"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(['all', 'personal', 'teams'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {mockConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`w-full flex items-start gap-3 p-4 hover:bg-secondary/50 transition-colors ${
                selectedConversation.id === conv.id ? 'bg-secondary/50' : ''
              }`}
            >
              <div className="relative">
                <Image
                  src={conv.avatar}
                  alt={conv.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                {conv.unread && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium truncate">{conv.name}</h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{conv.time}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{conv.message}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Image
              src={selectedConversation.avatar}
              alt={selectedConversation.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h3 className="font-medium">{selectedConversation.name}</h3>
              <p className="text-xs text-green-500">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-secondary rounded-full">
              <Phone className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-full bg-secondary">
              <Video className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-full">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mockMessages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-end gap-2 max-w-[70%]">
                {msg.sender === 'other' && (
                  <Image
                    src={selectedConversation.avatar}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <div>
                  <div 
                    className={`rounded-2xl px-4 py-2 ${
                      msg.sender === 'me'
                        ? 'bg-foreground text-background rounded-br-sm'
                        : 'bg-secondary rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  {msg.sender === 'other' && (
                    <p className="text-xs text-muted-foreground mt-1 text-right">{msg.time}</p>
                  )}
                </div>
                {msg.sender === 'me' && (
                  <span className="text-xs text-muted-foreground">...</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 bg-secondary rounded-full px-4 py-2">
            <button className="p-1 hover:bg-card rounded-full">
              <Paperclip className="w-5 h-5 text-muted-foreground" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
            <button className="p-1 hover:bg-card rounded-full">
              <Smile className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-2 bg-primary text-primary-foreground rounded-full">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
