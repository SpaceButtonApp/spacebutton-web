import { api } from './client'
import type { ApiResponse } from '@/lib/types/auth'
import type {
  ChatResponse, ChatListResponse,
  MessageResponse, MessageListResponse, DoneDealState,
} from '@/lib/types/chat'

export const chatApi = {
  async createChat(
    agentId: string,
    listingId: string | null,
    initialMessage: string,
  ): Promise<ChatResponse> {
    const body: Record<string, unknown> = { agent_id: agentId, initial_message: initialMessage }
    if (listingId) body.listing_id = listingId
    const res = await api.post<ApiResponse<ChatResponse>>('/chats', body)
    return res.data
  },

  async getChats(): Promise<ChatListResponse> {
    const res = await api.get<ApiResponse<ChatListResponse>>('/chats')
    return res.data
  },

  async getChat(chatId: string): Promise<ChatResponse> {
    const res = await api.get<ApiResponse<ChatResponse>>(`/chats/${chatId}`)
    return res.data
  },

  async getMyChatForListing(listingId: string): Promise<ChatResponse | null> {
    try {
      const res = await api.get<ApiResponse<ChatResponse | null>>(
        `/chats/listing/${listingId}/mine`,
      )
      return res.data
    } catch {
      return null
    }
  },

  async getMessages(chatId: string, page = 1, pageSize = 50): Promise<MessageListResponse> {
    const res = await api.get<ApiResponse<MessageListResponse>>(
      `/chats/${chatId}/messages?page=${page}&page_size=${pageSize}`,
    )
    return res.data
  },

  async sendMessage(chatId: string, content: string): Promise<MessageResponse> {
    const res = await api.post<ApiResponse<MessageResponse>>(
      `/chats/${chatId}/messages`,
      { content },
    )
    return res.data
  },

  async markRead(chatId: string): Promise<void> {
    await api.patch(`/chats/${chatId}/read`)
  },

  async getDoneDeal(chatId: string): Promise<DoneDealState> {
    const res = await api.get<ApiResponse<DoneDealState>>(`/chats/${chatId}/done-deal`)
    return res.data
  },

  async toggleDoneDeal(chatId: string): Promise<DoneDealState> {
    const res = await api.post<ApiResponse<DoneDealState>>(`/chats/${chatId}/done-deal`)
    return res.data
  },
}

export interface SupportMsg {
  id: string
  sender: 'user' | 'admin'
  text: string
  timestamp: string
}

export const supportApi = {
  async init(userName: string): Promise<void> {
    await api.post('/support/init', { user_name: userName })
  },

  async send(text: string): Promise<SupportMsg> {
    const res = await api.post<{ success: boolean; data: SupportMsg }>('/support/send', { text })
    return res.data
  },

  async getMessages(): Promise<SupportMsg[]> {
    const res = await api.get<{ success: boolean; data: SupportMsg[] }>('/support/messages')
    return res.data ?? []
  },
}
