import type {
  Conversation,
  Message,
  ApiResponse,
  SendMessageResponse,
  CreateConversationResponse,
  GetMessagesResponse,
  GetConversationsResponse,
  GetSuggestionsResponse
} from '@/types/api'

const API_BASE_URL = 'http://localhost:3000/api/v1'

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: ApiResponse<T> = await response.json()
    
    if (!data.success) {
      throw new Error('API request failed')
    }

    return data.data
  }

  async getConversations(): Promise<Conversation[]> {
    const data = await this.request<GetConversationsResponse>('/conversations')
    return data.conversation
  }

  async createConversation(title: string): Promise<Conversation> {
    const data = await this.request<CreateConversationResponse>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    })
    return data.conversation
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const data = await this.request<GetMessagesResponse>(`/messages/${conversationId}`)
    return data.messages
  }

  async sendMessage(conversationId: string, text: string): Promise<SendMessageResponse> {
    return await this.request<SendMessageResponse>(`/messages/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    })
  }

  async getSuggestions(): Promise<string[]> {
    const data = await this.request<GetSuggestionsResponse>('/suggestions')
    return data.suggestions
  }
}

export const apiClient = new ApiClient()