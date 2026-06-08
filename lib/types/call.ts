export type CallType = 'voice' | 'video'
export type CallStatus = 'initiated' | 'ongoing' | 'ended' | 'missed' | 'rejected'

export interface CallResponse {
  id: string
  caller_id: string
  receiver_id: string
  channel_name: string
  agora_token: string
  call_type: CallType
  status: CallStatus
  duration_seconds?: number
  started_at?: string
  ended_at?: string
  created_at: string
}

export interface CallHistoryResponse {
  total: number
  calls: CallResponse[]
}
