import { create } from 'zustand'
import type { Conversation, Message } from '@/types/api'
import { apiClient } from './api'

interface AppState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  isLoading: boolean
  suggestions: string[]
  
  // Actions
  setConversations: (conversations: Conversation[]) => void
  setCurrentConversation: (conversation: Conversation | null) => void
  setMessages: (messages: Message[]) => void
  setLoading: (isLoading: boolean) => void
  setSuggestions: (suggestions: string[]) => void
  
  // Async actions
  fetchConversations: () => Promise<void>
  fetchMessages: (conversationId: string) => Promise<void>
  createNewConversation: (title: string) => Promise<Conversation>
  sendMessage: (conversationId: string, text: string) => Promise<void>
  fetchSuggestions: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  suggestions: [],

  setConversations: (conversations) => set({ conversations }),
  setCurrentConversation: (currentConversation) => set({ currentConversation }),
  setMessages: (messages) => set({ messages }),
  setLoading: (isLoading) => set({ isLoading }),
  setSuggestions: (suggestions) => set({ suggestions }),

  fetchConversations: async () => {
    set({ isLoading: true })
    try {
      const conversations = await apiClient.getConversations()
      set({ conversations })
      
      // Set the first conversation as current if none is selected
      const { currentConversation } = get()
      if (!currentConversation && conversations.length > 0) {
        set({ currentConversation: conversations[0] })
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchMessages: async (conversationId: string) => {
    set({ isLoading: true })
    try {
      const messages = await apiClient.getMessages(conversationId)
      set({ messages })
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  createNewConversation: async (title: string) => {
    set({ isLoading: true })
    try {
      const conversation = await apiClient.createConversation(title)
      const { conversations } = get()
      set({ 
        conversations: [conversation, ...conversations],
        currentConversation: conversation,
        messages: []
      })
      return conversation
    } catch (error) {
      console.error('Failed to create conversation:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  sendMessage: async (conversationId: string, text: string) => {
    const { messages } = get()
    
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      conversationId,
      sender: 'user',
      text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    set({ messages: [...messages, userMessage] })
    
    try {
      const response = await apiClient.sendMessage(conversationId, text)
      
      // Add AI response
      const aiMessage: Message = {
        id: response.aiMessageId,
        conversationId,
        sender: 'ai',
        text: response.response,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      set({ messages: [...messages, userMessage, aiMessage] })
    } catch (error) {
      console.error('Failed to send message:', error)
      // Remove the user message if sending failed
      set({ messages: messages.filter(m => m.id !== userMessage.id) })
    }
  },

  fetchSuggestions: async () => {
    try {
      const suggestions = await apiClient.getSuggestions()
      set({ suggestions })
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    }
  },
}))