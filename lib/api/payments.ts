import { api } from './client'
import { useAppStore } from '@/lib/store'
import type { ApiResponse } from '@/lib/types/auth'
import type {
  ConnectPackage, PaystackInitResponse,
  ConnectsBalanceResponse, TransactionListResponse,
} from '@/lib/types/payment'

// Maps connects quantity → package name
export function connectsToPackage(qty: number): ConnectPackage {
  if (qty >= 50) return 'fifty'
  if (qty >= 10) return 'ten'
  if (qty >= 5) return 'five'
  return 'single'
}

export const paymentsApi = {
  async initializePayment(pkg: ConnectPackage, email: string, callbackUrl?: string): Promise<PaystackInitResponse> {
    const res = await api.post<ApiResponse<PaystackInitResponse>>(
      '/connects/initialize',
      { package: pkg, email, callback_url: callbackUrl },
    )
    return res.data
  },

  async verifyPayment(reference: string): Promise<{ connects_added: number }> {
    const res = await api.post<ApiResponse<{ connects_added: number }>>(
      '/connects/verify',
      { reference },
    )
    return res.data
  },

  async getBalance(): Promise<ConnectsBalanceResponse> {
    const res = await api.get<ApiResponse<ConnectsBalanceResponse>>('/connects/balance')
    return res.data
  },

  async getTransactions(): Promise<TransactionListResponse> {
    const res = await api.get<ApiResponse<TransactionListResponse>>('/connects/transactions')
    return res.data
  },
}

// Sync connects balance from backend into Zustand
export async function syncConnectsBalance(): Promise<void> {
  try {
    const { balance } = await paymentsApi.getBalance()
    const { user } = useAppStore.getState()
    if (user) {
      useAppStore.getState().updateUser({ connectsRemaining: balance })
    }
  } catch { /* non-critical */ }
}
