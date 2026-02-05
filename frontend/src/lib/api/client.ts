import type {
  APIResponse,
  SendMessageResponse,
  CreateConversationResponse,
  SuggestionsResponse,
  Message,
} from '$lib/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * API Client for backend communication
 */
class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Request failed',
        };
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred',
      };
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(params: {
    region?: string;
    userId?: string;
  }): Promise<APIResponse<CreateConversationResponse>> {
    return this.fetch<CreateConversationResponse>('/api/chat/conversations', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Send a message and get AI response
   */
  async sendMessage(params: {
    conversationId: string;
    message: string;
    region?: string;
    userId?: string;
  }): Promise<APIResponse<SendMessageResponse>> {
    return this.fetch<SendMessageResponse>('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Get conversation messages
   */
  async getMessages(
    conversationId: string,
    limit: number = 50
  ): Promise<APIResponse<{ messages: Message[]; count: number }>> {
    return this.fetch(`/api/chat/conversations/${conversationId}/messages?limit=${limit}`);
  }

  /**
   * Get suggested questions
   */
  async getSuggestions(region?: string): Promise<APIResponse<SuggestionsResponse>> {
    const query = region ? `?region=${region}` : '';
    return this.fetch<SuggestionsResponse>(`/api/chat/suggestions${query}`);
  }

  /**
   * Get all conversations with preview
   */
  async getConversations(limit: number = 50): Promise<APIResponse<{
    conversations: Array<{
      id: string;
      created_at: string;
      updated_at: string;
      lastMessage?: {
        text: string;
        sender: string;
        created_at: string;
      };
    }>;
    count: number;
  }>> {
    return this.fetch(`/api/chat/conversations?limit=${limit}`);
  }

  /**
   * Moderate a message
   */
  async moderateMessage(message: string): Promise<APIResponse<{
    safe: boolean;
    flagged: boolean;
    categories: string[];
  }>> {
    return this.fetch('/api/chat/moderate', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<APIResponse<{ status: string }>> {
    return this.fetch('/health');
  }
}

// Export singleton instance
export const apiClient = new APIClient(API_URL);

// Export class for testing
export { APIClient };
