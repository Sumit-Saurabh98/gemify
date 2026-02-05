/**
 * Type definitions for chat application
 */

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  sources?: string[];
}

export interface Conversation {
  id: string;
  createdAt: string;
  region?: string;
  userId?: string;
}

export interface ChatState {
  conversationId: string | null;
  messages: Message[];
  isTyping: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SendMessageResponse {
  conversationId: string;
  userMessageId: string;
  aiMessageId: string;
  response: string;
  sources: string[];
}

export interface CreateConversationResponse {
  conversationId: string;
  createdAt: string;
}

export interface SuggestionsResponse {
  suggestions: string[];
}
