import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { Property, Conversation, Notification } from './mock-data';
import { mockProperties, mockConversations, mockNotifications } from './mock-data';

// Create a safe storage wrapper that works on both native and web
const createSafeStorage = () => {
  // Check if we're running on web and if window is available
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return {
      getItem: (name: string) => {
        try {
          const value = window.localStorage.getItem(name);
          return Promise.resolve(value);
        } catch {
          return Promise.resolve(null);
        }
      },
      setItem: (name: string, value: string) => {
        try {
          window.localStorage.setItem(name, value);
          return Promise.resolve();
        } catch {
          return Promise.resolve();
        }
      },
      removeItem: (name: string) => {
        try {
          window.localStorage.removeItem(name);
          return Promise.resolve();
        } catch {
          return Promise.resolve();
        }
      },
    };
  }
  // Use AsyncStorage for native
  return AsyncStorage;
};

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  type: 'individual' | 'agent';
  isLoggedIn: boolean;
  referralCode: string;
  referredCount: number;
  location?: string;
  walletBalance: number;
  isPremium: boolean;
  premiumType?: 'basic' | 'premium';
  connectsRemaining: number;
}

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  title: string;
  amount: number;
  date: string;
}

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Properties
  properties: Property[];
  closedProperties: string[];
  savedProperties: string[];
  toggleSaveProperty: (id: string) => void;
  addProperty: (property: Property) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  closeProperty: (id: string) => void;
  
  // Conversations
  conversations: Conversation[];
  
  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id'> & { id?: string }) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  
  // UI State
  activeTab: 'connect' | 'agent' | 'shortlet' | 'properties';
  setActiveTab: (tab: 'connect' | 'agent' | 'shortlet' | 'properties') => void;
  
  // Wallet
  addToWallet: (amount: number) => void;
  deductFromWallet: (amount: number) => boolean;
  
  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  
  // Connects
  deductConnect: () => boolean;
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
      
      // Theme
      theme: 'dark',
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'dark' ? 'light' : 'dark'
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
      
      // Conversations
      conversations: mockConversations,
      
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
      
      // UI State
      activeTab: 'connect',
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      // Wallet
      addToWallet: (amount) => set((state) => {
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          type: 'credit',
          title: 'Wallet Top Up',
          amount,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
        return {
          user: state.user 
            ? { ...state.user, walletBalance: state.user.walletBalance + amount }
            : null,
          transactions: [newTransaction, ...state.transactions]
        };
      }),
      deductFromWallet: (amount) => {
        const state = get();
        if (!state.user || state.user.walletBalance < amount) return false;
        set({
          user: { ...state.user, walletBalance: state.user.walletBalance - amount }
        });
        return true;
      },
      
      // Transactions
      transactions: [],
      addTransaction: (transaction) => set((state) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: Date.now().toString(),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
        return {
          transactions: [newTransaction, ...state.transactions]
        };
      }),
      
      // Connects
      deductConnect: () => {
        const state = get();
        if (!state.user || state.user.connectsRemaining <= 0) return false;
        set({
          user: { ...state.user, connectsRemaining: state.user.connectsRemaining - 1 }
        });
        return true;
      },

      // Conversations
      conversations: mockConversations,
      addConversation: (conversation) => set((state) => {
        // Check if conversation already exists by user id
        const existingIndex = state.conversations.findIndex(c => c.user.id === conversation.user.id);
        if (existingIndex !== -1) {
          // Update existing conversation with new message
          const updatedConversations = [...state.conversations];
          updatedConversations[existingIndex] = {
            ...updatedConversations[existingIndex],
            lastMessage: conversation.lastMessage,
            timestamp: conversation.timestamp,
          };
          return { conversations: updatedConversations };
        }
        // Add new conversation
        return {
          conversations: [conversation, ...state.conversations]
        };
      }),
    }),
    {
      name: 'spacebutton-storage',
      storage: createJSONStorage(() => createSafeStorage()),
      skipHydration: Platform.OS === 'web', // Skip hydration on web to avoid useLayoutEffect warning
      partialize: (state) => ({
        user: state.user,
        theme: state.theme,
        savedProperties: state.savedProperties,
        transactions: state.transactions,
        closedProperties: state.closedProperties,
        notifications: state.notifications,
        properties: state.properties,
        conversations: state.conversations,
      }),
    }
  )
);
