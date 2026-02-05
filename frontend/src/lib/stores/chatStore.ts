import { writable, derived, get } from 'svelte/store';
import type { Message, ChatState } from '../types';

/**
 * Chat state store
 */
function createChatStore() {
  const initialState: ChatState = {
    conversationId: null,
    messages: [],
    isTyping: false,
    isLoading: false,
    error: null,
  };

  const { subscribe, set, update } = writable<ChatState>(initialState);

  return {
    subscribe,
    
    /**
     * Initialize conversation with welcome message
     */
    initialize: (conversationId?: string) => {
      const welcomeMessage: Message = {
        id: 'welcome',
        sender: 'ai',
        text: conversationId 
          ? "Welcome back! How can I help you today?"
          : "Hi! I'm the GamerHub AI assistant. How can I help you today?",
        timestamp: new Date().toISOString(),
      };
      
      update(state => ({
        ...state,
        conversationId: conversationId || null,
        messages: [welcomeMessage],
        error: null,
      }));
    },
    
    /**
     * Set conversation ID
     */
    setConversationId: (id: string) => {
      update(state => ({ ...state, conversationId: id }));
    },
    
    /**
     * Add a message to the chat
     */
    addMessage: (message: Message) => {
      update(state => ({
        ...state,
        messages: [...state.messages, message],
      }));
    },
    
    /**
     * Add multiple messages
     */
    addMessages: (messages: Message[]) => {
      update(state => ({
        ...state,
        messages: [...state.messages, ...messages],
      }));
    },
    
    /**
     * Update a specific message
     */
    updateMessage: (id: string, updates: Partial<Message>) => {
      update(state => ({
        ...state,
        messages: state.messages.map((msg: Message) =>
          msg.id === id ? { ...msg, ...updates } : msg
        ),
      }));
    },
    
    /**
     * Set typing indicator
     */
    setTyping: (isTyping: boolean) => {
      update(state => ({ ...state, isTyping }));
    },
    
    /**
     * Set loading state
     */
    setLoading: (isLoading: boolean) => {
      update(state => ({ ...state, isLoading }));
    },
    
    /**
     * Set error state
     */
    setError: (error: string | null) => {
      update(state => ({ ...state, error }));
    },
    
    /**
     * Clear all messages
     */
    clearMessages: () => {
      update(state => ({ ...state, messages: [] }));
    },
    
    /**
     * Reset entire store
     */
    reset: () => {
      set(initialState);
    },
    
    /**
     * Get current state (useful for imperative actions)
     */
    getState: () => get({ subscribe }),
  };
}

export const chatStore = createChatStore();

/**
 * Derived store for message count
 */
export const messageCount = derived(
  chatStore,
  $chatStore => $chatStore.messages.length
);

/**
 * Derived store for has conversation
 */
export const hasConversation = derived(
  chatStore,
  $chatStore => $chatStore.conversationId !== null
);

/**
 * Derived store for user messages only
 */
export const userMessages = derived(
  chatStore,
  $chatStore => $chatStore.messages.filter((m: Message) => m.sender === 'user')
);

/**
 * Derived store for AI messages only
 */
export const aiMessages = derived(
  chatStore,
  $chatStore => $chatStore.messages.filter((m: Message) => m.sender === 'ai')
);
