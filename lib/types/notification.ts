export type NotificationType =
  | 'new_message'
  | 'new_listing'
  | 'low_connects'
  | 'new_call'
  | 'kyc_update'
  | 'general'
  | 'verification_id_approved'
  | 'verification_id_rejected'
  | 'verification_live_approved'
  | 'verification_live_rejected'
  | 'done_deal'

export interface NotificationResponse {
  id: string
  user_id: string
  title: string
  body: string
  notification_type: NotificationType
  channel: 'email' | 'push' | 'in_app'
  is_read: boolean
  is_sent: boolean
  extra_data?: Record<string, unknown>
  created_at: string
}

export interface NotificationListResponse {
  total: number
  page: number
  page_size: number
  notifications: NotificationResponse[]
}
