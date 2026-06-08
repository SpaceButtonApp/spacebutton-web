import { api } from './client'
import type { ApiResponse } from '@/lib/types/auth'
import type { NotificationListResponse } from '@/lib/types/notification'

export const notificationsApi = {
  async getNotifications(page = 1, pageSize = 30): Promise<NotificationListResponse> {
    const res = await api.get<ApiResponse<NotificationListResponse>>(
      `/notifications?page=${page}&page_size=${pageSize}`,
    )
    return res.data
  },

  async markRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`)
  },

  async markAllRead(): Promise<void> {
    await api.patch('/notifications/read-all')
  },

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`)
  },
}
