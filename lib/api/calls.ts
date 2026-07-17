import { api } from './client'
import type { ApiResponse } from '@/lib/types/auth'
import type { CallResponse, CallHistoryResponse, CallType, CallStatus } from '@/lib/types/call'

export const callsApi = {
  async initiateCall(receiverId: string, callType: CallType = 'voice'): Promise<CallResponse> {
    const res = await api.post<ApiResponse<CallResponse>>('/calls', {
      receiver_id: receiverId,
      call_type: callType,
    })
    return res.data
  },

  async joinCall(callId: string): Promise<CallResponse> {
    const res = await api.post<ApiResponse<CallResponse>>(`/calls/${callId}/join`)
    return res.data
  },

  async endCall(callId: string, status: CallStatus = 'ended'): Promise<CallResponse> {
    const res = await api.post<ApiResponse<CallResponse>>(`/calls/${callId}/end`, { status })
    return res.data
  },

  async getIncomingCall(): Promise<CallResponse | null> {
    try {
      const res = await api.get<ApiResponse<{ call: CallResponse | null }>>('/calls/incoming')
      return res.data.call
    } catch {
      return null
    }
  },

  async getCall(callId: string): Promise<CallResponse> {
    const res = await api.get<ApiResponse<CallResponse>>(`/calls/${callId}`)
    return res.data
  },

  async getHistory(otherUserId?: string): Promise<CallHistoryResponse> {
    const qs = otherUserId ? `?other_user_id=${otherUserId}` : ''
    const res = await api.get<ApiResponse<CallHistoryResponse>>(`/calls/history${qs}`)
    return res.data
  },
}
