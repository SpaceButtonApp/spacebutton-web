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

interface DoneDealState {
  [chatId: string]: {
    user: boolean
    agent: boolean
    locked: boolean
  }
}

interface Review {
  id: string
  fromUserId: string
  fromUserName: string
  fromUserAvatar: string
  toUserId: string
  rating: number
  feedback: string
  createdAt: string
}

interface SupportMessage {
  id: string
  text: string
  sender: 'user' | 'admin'
  userId: string
  userName: string
  timestamp: string
}

interface SupportChat {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  messages: SupportMessage[]
  lastMessage: string
  lastMessageTime: string
  unread: number
}

interface Report {
  id: string
  reportedUserId: string
  reportedUserName: string
  reporterId: string
  reporterName: string
  reason: 'scam' | 'harassment' | 'fake' | 'other'
  details: string
  reportedAt: string
  status: 'pending' | 'reviewed' | 'resolved'
}

interface RegisteredUser {
  id: string
  userId: string // Format: SB2600000001
  name: string
  email: string
  phone: string
  avatar?: string
  type: 'individual' | 'agent'
  status: 'active' | 'suspended' | 'inactive'
  listings: number
  joined: string
  offenseCount: number
}

interface AppState {
  // User
  user: User | null
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  
  // Properties
  properties: Property[]
  closedProperties: string[]
  savedProperties: string[]
  toggleSaveProperty: (id: string) => void
  addProperty: (property: Property) => void
  updateProperty: (id: string, updates: Partial<Property>) => void
  deleteProperty: (id: string) => void
  closeProperty: (id: string) => void
  incrementPropertyViews: (id: string) => void
  
  // Reviews
  reviews: Review[]
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void
  
  // Done Deal
  doneDealStates: DoneDealState
  toggleDoneDeal: (chatId: string, propertyId: string, isAgent: boolean) => boolean
  
  // Conversations
  conversations: Conversation[]
  addConversation: (conversation: Conversation) => void
  
  // Notifications
  notifications: Notification[]
  markNotificationRead: (id: string) => void
  addNotification: (notification: Omit<Notification, 'id'> & { id?: string }) => void
  markAllNotificationsRead: () => void
  clearAllNotifications: () => void
  deleteNotification: (id: string) => void
  
  // Support Chat
  supportChats: SupportChat[]
  addSupportMessage: (userId: string, userName: string, message: string, sender: 'user' | 'admin') => void
  getSupportChat: (userId: string) => SupportChat | undefined
  
  // Registered Users
  registeredUsers: RegisteredUser[]
  addRegisteredUser: (user: Omit<RegisteredUser, 'id' | 'userId' | 'joined' | 'listings' | 'status' | 'offenseCount'>) => void
  updateRegisteredUser: (id: string, updates: Partial<RegisteredUser>) => void
  deleteRegisteredUser: (id: string) => void
  
  // Reports
  reports: Report[]
  addReport: (report: Omit<Report, 'id'>) => void
  updateReport: (id: string, updates: Partial<Report>) => void
  
  // UI State
  activeTab: 'connect' | 'agent' | 'shortlet' | 'properties'
  setActiveTab: (tab: 'connect' | 'agent' | 'shortlet' | 'properties') => void
  
  // Premium
  purchasePremium: (type: 'basic-single' | 'basic-5' | 'basic-10' | 'basic-50' | 'premium-monthly' | 'premium-yearly', amount: number) => void
  
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
      closedProperties: [],
      savedProperties: [],
      toggleSaveProperty: (id) => set((state) => ({
        savedProperties: state.savedProperties.includes(id)
          ? state.savedProperties.filter((pId) => pId !== id)
          : [...state.savedProperties, id]
      })),
      addProperty: (property) => set((state) => ({
        properties: [property, ...state.properties]
      })),
      updateProperty: (id, updates) => set((state) => ({
        properties: state.properties.map((p) => 
          p.id === id ? { ...p, ...updates } : p
        )
      })),
      deleteProperty: (id) => set((state) => ({
        properties: state.properties.filter((p) => p.id !== id)
      })),
      closeProperty: (id) => set((state) => ({
        closedProperties: [...state.closedProperties, id]
      })),
      incrementPropertyViews: (id) => set((state) => ({
        properties: state.properties.map((p) =>
          p.id === id ? { ...p, views: (p.views || 0) + 1 } : p
        )
      })),
      
      // Reviews
      reviews: [],
      addReview: (review) => set((state) => ({
        reviews: [{
          ...review,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        }, ...state.reviews]
      })),
      
      // Done Deal
      doneDealStates: {},
      toggleDoneDeal: (chatId, propertyId, isAgent) => {
        const state = get()
        const currentState = state.doneDealStates[chatId] || { user: false, agent: false, locked: false }
        
        // If already locked, can't toggle
        if (currentState.locked) return false
        
        // Update the appropriate side
        const newState = {
          ...currentState,
          [isAgent ? 'agent' : 'user']: !currentState[isAgent ? 'agent' : 'user']
        }
        
        // Check if both sides have agreed
        if (newState.user && newState.agent) {
          newState.locked = true
          // Close the property
          set((s) => ({
            doneDealStates: { ...s.doneDealStates, [chatId]: newState },
            closedProperties: [...s.closedProperties, propertyId],
            notifications: [{
              id: Date.now().toString(),
              type: 'done_deal',
              title: 'Congratulations! Done Deal',
              message: 'Both parties have confirmed the deal. The property has been closed.',
              read: false,
              createdAt: new Date().toISOString(),
              propertyId
            }, ...s.notifications]
          }))
          return true
        }
        
        set((s) => ({
          doneDealStates: { ...s.doneDealStates, [chatId]: newState }
        }))
        return false
      },
      
      // Conversations
      conversations: mockConversations,
      addConversation: (conversation) => set((state) => {
        // Check if conversation already exists by user id
        const existingIndex = state.conversations.findIndex(c => c.user.id === conversation.user.id)
        if (existingIndex !== -1) {
          // Update existing conversation with new message
          const updatedConversations = [...state.conversations]
          updatedConversations[existingIndex] = {
            ...updatedConversations[existingIndex],
            lastMessage: conversation.lastMessage,
            timestamp: conversation.timestamp,
          }
          return { conversations: updatedConversations }
        }
        // Add new conversation
        return {
          conversations: [conversation, ...state.conversations]
        }
      }),
      
      // Notifications
      notifications: mockNotifications,
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        )
      })),
      addNotification: (notification) => set((state) => ({
        notifications: [{
          ...notification,
          id: notification.id || Date.now().toString(),
        } as Notification, ...state.notifications]
      })),
      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true }))
      })),
      clearAllNotifications: () => set({ notifications: [] }),
      deleteNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      })),
      
      // Support Chat
      supportChats: [],
      addSupportMessage: (userId, userName, message, sender) => set((state) => {
        const existingChat = state.supportChats.find(c => c.userId === userId)
        const newMessage: SupportMessage = {
          id: Date.now().toString(),
          text: message,
          sender,
          userId,
          userName,
          timestamp: new Date().toISOString()
        }
        
        if (existingChat) {
          return {
            supportChats: state.supportChats.map(chat => 
              chat.userId === userId 
                ? {
                    ...chat,
                    messages: [...chat.messages, newMessage],
                    lastMessage: message,
                    lastMessageTime: 'Just now',
                    unread: sender === 'user' ? chat.unread + 1 : 0
                  }
                : chat
            )
          }
        } else {
          const newChat: SupportChat = {
            id: Date.now().toString(),
            userId,
            userName,
            messages: [newMessage],
            lastMessage: message,
            lastMessageTime: 'Just now',
            unread: sender === 'user' ? 1 : 0
          }
          return {
            supportChats: [newChat, ...state.supportChats]
          }
        }
      }),
      getSupportChat: (userId) => get().supportChats.find(c => c.userId === userId),
      
      // Registered Users
      registeredUsers: [],
      addRegisteredUser: (user) => set((state) => {
        const userNumber = state.registeredUsers.length + 1
        const userId = `SB26${String(userNumber).padStart(8, '0')}`
        return {
          registeredUsers: [{
            ...user,
            id: Date.now().toString(),
            userId,
            joined: new Date().toISOString().split('T')[0],
            listings: 0,
            status: 'active',
            offenseCount: 0
          }, ...state.registeredUsers]
        }
      }),
      updateRegisteredUser: (id, updates) => set((state) => ({
        registeredUsers: state.registeredUsers.map(u => 
          u.id === id ? { ...u, ...updates } : u
        )
      })),
      deleteRegisteredUser: (id) => set((state) => ({
        registeredUsers: state.registeredUsers.filter(u => u.id !== id)
      })),
      
      // Reports
      reports: [],
      addReport: (report) => set((state) => {
        const newReport = {
          ...report,
          id: `RPT${Date.now()}`
        }
        // Increment offense count for the reported user
        const updatedUsers = state.registeredUsers.map(u =>
          u.id === report.reportedUserId 
            ? { ...u, offenseCount: (u.offenseCount || 0) + 1 }
            : u
        )
        return {
          reports: [newReport, ...state.reports],
          registeredUsers: updatedUsers
        }
      }),
      
      updateReport: (id, updates) => set((state) => ({
        reports: state.reports.map(r => r.id === id ? { ...r, ...updates } : r)
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
          case 'basic-10':
            connectsToAdd = 10
            break
          case 'basic-50':
            connectsToAdd = 50
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
        closedProperties: state.closedProperties,
        doneDealStates: state.doneDealStates,
        reviews: state.reviews,
        notifications: state.notifications,
        supportChats: state.supportChats,
        registeredUsers: state.registeredUsers,
        properties: state.properties,
        conversations: state.conversations,
        reports: state.reports,
      }),
    }
  )
)
