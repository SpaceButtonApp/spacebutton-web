export type ConnectPackage = 'single' | 'five' | 'ten' | 'fifty'

export interface InitializePaymentRequest {
  package: ConnectPackage
  email: string
}

export interface PaystackInitResponse {
  authorization_url: string
  access_code: string
  reference: string
  connects_qty: number
  amount_kobo: number
}

export interface ConnectsBalanceResponse {
  user_id: string
  balance: number
}

export type TransactionType = 'purchase' | 'deduction' | 'bonus'
export type TransactionStatus = 'pending' | 'success' | 'failed'

export interface TransactionResponse {
  id: string
  user_id: string
  transaction_type: TransactionType
  status: TransactionStatus
  amount_kobo?: number
  connects_qty: number
  paystack_reference?: string
  description: string
  created_at: string
}

export interface TransactionListResponse {
  total: number
  transactions: TransactionResponse[]
}
