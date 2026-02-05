import { apiClient } from './client';
import { chatStore } from '../stores/chatStore';
import type { Message } from '../types';

/**
 * Chat service - handles chat operations with API
 */
export const chatService = {
  /**
   * Initialize a new conversation
   */
  async initializeConversation(params: { region?: string; userId?: string } = {}) {
    chatStore.setLoading(true);
    chatStore.setError(null);

    try {
      const response = await apiClient.createConversation(params);

      if (response.success && response.data) {
        chatStore.setConversationId(response.data.conversationId);
        return response.data.conversationId;
      } else {
        chatStore.setError(response.error || 'Failed to create conversation');
        return null;
      }
    } catch (error: any) {
      chatStore.setError(error.message);
      return null;
    } finally {
      chatStore.setLoading(false);
    }
  },

  /**
   * Send a message and get AI response
   */
  async sendMessage(
    message: string,
    options: { region?: string; userId?: string } = {}
  ): Promise<boolean> {
    const state = chatStore.getState();
    
    // Create conversation if needed
    let conversationId = state.conversationId;
    if (!conversationId) {
      conversationId = await this.initializeConversation(options);
      if (!conversationId) {
        return false;
      }
    }

    // Add user message to UI immediately
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      text: message,
      timestamp: new Date().toISOString(),
    };
    chatStore.addMessage(userMessage);

    // Show typing indicator
    chatStore.setTyping(true);
    chatStore.setError(null);

    try {
      const response = await apiClient.sendMessage({
        conversationId,
        message,
        ...options,
      });

      if (response.success && response.data) {
        // Update user message with real ID
        chatStore.updateMessage(userMessage.id, {
          id: response.data.userMessageId,
        });

        // Add AI response
        const aiMessage: Message = {
          id: response.data.aiMessageId,
          sender: 'ai',
          text: response.data.response,
          timestamp: new Date().toISOString(),
          sources: response.data.sources,
        };
        chatStore.addMessage(aiMessage);

        return true;
      } else {
        chatStore.setError(response.error || 'Failed to send message');
        // Remove the temporary user message on error
        const messages = chatStore.getState().messages.filter((m: Message) => m.id !== userMessage.id);
        chatStore.clearMessages();
        messages.forEach((m: Message) => chatStore.addMessage(m));
        return false;
      }
    } catch (error: any) {
      chatStore.setError(error.message);
      return false;
    } finally {
      chatStore.setTyping(false);
    }
  },

  /**
   * Load conversation messages
   */
  async loadMessages(conversationId: string, limit: number = 50): Promise<boolean> {
    chatStore.setLoading(true);
    chatStore.setError(null);

    try {
      const response = await apiClient.getMessages(conversationId, limit);

      if (response.success && response.data) {
        chatStore.clearMessages();
        chatStore.addMessages(response.data.messages);
        return true;
      } else {
        chatStore.setError(response.error || 'Failed to load messages');
        return false;
      }
    } catch (error: any) {
      chatStore.setError(error.message);
      return false;
    } finally {
      chatStore.setLoading(false);
    }
  },

  /**
   * Get suggested questions
   */
  async getSuggestions(region?: string): Promise<string[]> {
    try {
      const response = await apiClient.getSuggestions(region);

      if (response.success && response.data) {
        return response.data.suggestions;
      } else {
        console.error('Failed to load suggestions:', response.error);
        return [];
      }
    } catch (error: any) {
      console.error('Error loading suggestions:', error);
      return [];
    }
  },
};
