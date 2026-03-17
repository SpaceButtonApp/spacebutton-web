'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Property, Agent, Conversation, Notification } from './mock-data'
import { mockProperties, mockConversations, mockNotifications, currentUser } from './mock-data'

interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  type: 'individual' | 'agent'
  isLoggedIn: boolean
  referralCode: string
  referredCount: number
  location?: string
  walletBalance: number
  isPremium: boolean
  premiumType?: 'basic' | 'premium'
  connectsRemaining: number
}

interface Transaction {
  id: string
  type: 'credit' | 'debit'
  title: string
  amount: number
  date: string
}

interface AppState {
  // User
  user: User | null
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  
  // Properties
  properties: Property[]
  savedProperties: string[]
  toggleSaveProperty: (id: string) => void
  
  // Conversations
  conversations: Conversation[]
  
  // Notifications
  notifications: Notification[]
  markNotificationRead: (id: string) => void
  
  // UI State
  activeTab: 'connect' | 'agent' | 'shortlet' | 'properties'
  setActiveTab: (tab: 'connect' | 'agent' | 'shortlet' | 'properties') => void
  
  // Premium
  purchasePremium: (type: 'basic-single' | 'basic-5' | 'premium-monthly' | 'premium-yearly', amount: number) => void
  
  // Wallet
  addToWallet: (amount: number) => void
  deductFromWallet: (amount: number) => boolean
  
  // Transactions
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void
  
  // Connects
  connectsRemaining: number
  deductConnect: () => boolean
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      
      // Properties
      properties: mockProperties,
      savedProperties: [],
      toggleSaveProperty: (id) => set((state) => ({
        savedProperties: state.savedProperties.includes(id)
          ? state.savedProperties.filter((pId) => pId !== id)
          : [...state.savedProperties, id]
      })),
      
      // Conversations
      conversations: mockConversations,
      
      // Notifications
      notifications: mockNotifications,
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        )
      })),
      
      // UI State
      activeTab: 'connect',
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      // Premium
      purchasePremium: (type, amount) => set((state) => {
        if (!state.user) return state
        
        let connectsToAdd = 0
        let isPremium = state.user.isPremium
        let premiumType = state.user.premiumType
        
        switch (type) {
          case 'basic-single':
            connectsToAdd = 1
            break
          case 'basic-5':
            connectsToAdd = 5
            break
          case 'premium-monthly':
          case 'premium-yearly':
            isPremium = true
            premiumType = 'premium'
            connectsToAdd = 999 // Unlimited
            break
        }
        
        // Only deduct from wallet if amount > 0 (wallet payment)
        const newWalletBalance = amount > 0 
          ? state.user.walletBalance - amount 
          : state.user.walletBalance
        
        return {
          user: {
            ...state.user,
            walletBalance: newWalletBalance,
            isPremium,
            premiumType,
            connectsRemaining: state.user.connectsRemaining + connectsToAdd
          }
        }
      }),
      
      // Wallet
      addToWallet: (amount) => set((state) => {
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          type: 'credit',
          title: 'Wallet Top Up',
          amount,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }
        return {
          user: state.user 
            ? { ...state.user, walletBalance: state.user.walletBalance + amount }
            : null,
          transactions: [newTransaction, ...state.transactions]
        }
      }),
      deductFromWallet: (amount) => {
        const state = get()
        if (!state.user || state.user.walletBalance < amount) return false
        set({
          user: { ...state.user, walletBalance: state.user.walletBalance - amount }
        })
        return true
      },
      
      // Transactions
      transactions: [],
      addTransaction: (transaction) => set((state) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: Date.now().toString(),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }
        return {
          transactions: [newTransaction, ...state.transactions]
        }
      }),
      
      // Connects
      connectsRemaining: 0,
      deductConnect: () => {
        const state = get()
        if (!state.user || state.user.connectsRemaining <= 0) return false
        set({
          user: { ...state.user, connectsRemaining: state.user.connectsRemaining - 1 }
        })
        return true
      }
    }),
    {
      name: 'spacebutton-storage',
      partialize: (state) => ({
        user: state.user,
        savedProperties: state.savedProperties,
        transactions: state.transactions,
      }),
    }
  )
)
