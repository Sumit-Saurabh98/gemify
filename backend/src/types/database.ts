/**
 * Database entity type definitions
 */

export interface Conversation {
  id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'ai';
  text: string;
  created_at: Date;
}

export interface FAQKnowledge {
  id: string;
  category: string;
  question: string;
  answer: string;
  region: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Input types for creating new entities
 */

export interface CreateConversationInput {
  metadata?: Record<string, any>;
}

export interface CreateMessageInput {
  conversation_id: string;
  sender: 'user' | 'ai';
  text: string;
  metadata?: Record<string, any>;
}

export interface CreateFAQInput {
  category: string;
  question: string;
  answer: string;
  region?: string | null;
}
