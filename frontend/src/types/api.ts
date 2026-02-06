export interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  sender: 'user' | 'ai'
  text: string
  createdAt: string
  updatedAt: string
}

export interface Suggestion {
  text: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface SendMessageRequest {
  text: string
}

export interface SendMessageResponse {
  conversationId: string
  userMessageId: string
  aiMessageId: string
  response: string
}

export interface ErrorResponse {
  conversationId: string
  message: string
  success: boolean
}

export interface CreateConversationRequest {
  title: string
}

export interface CreateConversationResponse {
  conversation: Conversation
}

export interface GetMessagesResponse {
  messages: Message[]
}

export interface GetConversationsResponse {
  conversation: Conversation[]
}

export interface GetSuggestionsResponse {
  suggestions: string[]
}