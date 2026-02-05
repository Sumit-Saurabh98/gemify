import aiService from './AIService';
import cacheService from './CacheService';
import faqRepository from '../models/FAQRepository';
import messageRepository from '../models/MessageRepository';
import conversationRepository from '../models/ConversationRepository';
import { Message } from '../types/database';

/**
 * Chat Service - Orchestrates FAQ retrieval, caching, and AI responses
 */
export class ChatService {
  /**
   * Search for relevant FAQs based on user query
   */
  private async findRelevantFAQs(query: string, region?: string): Promise<string> {
    // Try cache first
    const cachedResults = await cacheService.getCachedFAQSearch(query, region);
    
    if (cachedResults) {
      console.log('✅ FAQ cache hit for query:', query);
      return this.formatFAQContext(cachedResults);
    }

    // Search in database
    console.log('🔍 Searching FAQs for query:', query);
    const results = await faqRepository.search(query, region);

    // Cache the results
    await cacheService.cacheFAQSearch(query, region, results);

    return this.formatFAQContext(results);
  }

  /**
   * Format FAQ results into context string
   */
  private formatFAQContext(faqs: any[]): string {
    if (faqs.length === 0) {
      return 'No relevant FAQ information found.';
    }

    return faqs
      .map((faq, index) => {
        const regionInfo = faq.region ? ` [${faq.region}]` : ' [Global]';
        return `${index + 1}. Category: ${faq.category}${regionInfo}\nQ: ${faq.question}\nA: ${faq.answer}`;
      })
      .join('\n\n');
  }

  /**
   * Get conversation history for context
   */
  private async getConversationHistory(conversationId: string, limit: number = 10): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
    // Try cache first
    const cached = await cacheService.getCachedMessageHistory(conversationId);
    
    if (cached) {
      console.log('✅ Message history cache hit');
      return cached.slice(-limit);
    }

    // Get from database
    const messages = await messageRepository.getRecentMessages(conversationId, limit);

    const history = messages.map((msg: Message) => ({
      role: msg.sender as 'user' | 'assistant',
      content: msg.text,
    }));

    // Cache the history
    await cacheService.cacheMessageHistory(conversationId, history);

    return history;
  }

  /**
   * Generate AI response for user message
   */
  async generateResponse(
    conversationId: string,
    userMessage: string,
    options: {
      region?: string;
      includeHistory?: boolean;
    } = {}
  ): Promise<{ response: string; sources: string[] }> {
    try {
      // 1. Find relevant FAQs based on user query
      const faqContext = await this.findRelevantFAQs(userMessage, options.region);

      // 2. Get conversation history if requested
      let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
      
      if (options.includeHistory !== false) {
        conversationHistory = await this.getConversationHistory(conversationId, 10);
      }

      // 3. Generate AI response using FAQ context and history
      const response = await aiService.generateSupportResponse(
        userMessage,
        faqContext,
        conversationHistory
      );

      // 4. Determine sources (for transparency)
      const sources = this.extractSources(faqContext);

      return {
        response,
        sources,
      };
    } catch (error: any) {
      console.error('❌ Chat service error:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /**
   * Process a complete chat interaction (save messages + generate response)
   */
  async processChat(
    conversationId: string,
    userMessage: string,
    options: {
      region?: string;
      userId?: string;
    } = {}
  ): Promise<{
    userMessageId: string;
    aiMessageId: string;
    response: string;
    sources: string[];
  }> {
    try {
      // 1. Save user message
      const userMsg = await messageRepository.create({
        conversation_id: conversationId,
        sender: 'user',
        text: userMessage,
        metadata: {
          region: options.region,
          userId: options.userId,
          timestamp: new Date().toISOString(),
        },
      });

      // 2. Generate AI response
      const { response, sources } = await this.generateResponse(
        conversationId,
        userMessage,
        { region: options.region, includeHistory: true }
      );

      // 3. Save AI response
      const aiMsg = await messageRepository.create({
        conversation_id: conversationId,
        sender: 'ai',
        text: response,
        metadata: {
          sources,
          timestamp: new Date().toISOString(),
        },
      });

      // 4. Invalidate message cache since we added new messages
      await cacheService.invalidateConversationCache(conversationId);

      return {
        userMessageId: userMsg.id,
        aiMessageId: aiMsg.id,
        response,
        sources,
      };
    } catch (error: any) {
      console.error('❌ Process chat error:', error);
      throw new Error(`Failed to process chat: ${error.message}`);
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(metadata?: Record<string, any>) {
    return await conversationRepository.create({ metadata });
  }

  /**
   * Get conversation details
   */
  async getConversation(conversationId: string) {
    return await conversationRepository.findById(conversationId);
  }

  /**
   * Get conversation messages
   */
  async getConversationMessages(conversationId: string, limit: number = 50) {
    return await messageRepository.findByConversationId(conversationId, limit);
  }

  /**
   * Extract source categories from FAQ context
   */
  private extractSources(faqContext: string): string[] {
    const sources: Set<string> = new Set();
    const categoryMatches = faqContext.matchAll(/Category: ([^[\n]+)/g);
    
    for (const match of categoryMatches) {
      sources.add(match[1].trim());
    }
    
    return Array.from(sources);
  }

  /**
   * Moderate user message for safety
   */
  async moderateMessage(message: string): Promise<{
    safe: boolean;
    flagged: boolean;
    categories: Record<string, boolean>;
  }> {
    const moderation = await aiService.moderateContent(message);
    
    return {
      safe: !moderation.flagged,
      flagged: moderation.flagged,
      categories: moderation.categories,
    };
  }

  /**
   * Get suggested follow-up questions based on current context
   */
  async getSuggestedQuestions(_region?: string): Promise<string[]> {
    // Create generic suggestions based on categories
    const suggestions = [
      'What are your shipping options?',
      'How do I return a product?',
      'What payment methods do you accept?',
      'Do you have gaming mice in stock?',
      'What is your warranty policy?',
    ];

    return suggestions.slice(0, 3);
  }
}

export default new ChatService();
