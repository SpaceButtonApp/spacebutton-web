export interface ChatResponse {
  id: string
  user_id: string
  agent_id: string
  listing_id: string | null
  status: 'active' | 'archived' | 'blocked'
  user_unread_count: number
  agent_unread_count: number
  last_message: string | null
  last_sender_id: string | null
  created_at: string
  updated_at: string
}

export interface ChatListResponse {
  total: number
  chats: ChatResponse[]
}

export interface MessageResponse {
  id: string
  chat_id: string
  sender_id: string
  content: string
  status: 'sent' | 'delivered' | 'read'
  is_deleted: boolean
  created_at: string
}

export interface MessageListResponse {
  total: number
  page: number
  page_size: number
  messages: MessageResponse[]
}

export interface DoneDealState {
  my_done_deal: boolean
  their_done_deal: boolean
  deal_locked: boolean
}
