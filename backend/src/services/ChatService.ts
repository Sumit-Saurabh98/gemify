import aiService from './AIService';
import cacheService from './CacheService';
import faqRepository from '../models/FAQRepository';
import messageRepository from '../models/MessageRepository';
import conversationRepository from '../models/ConversationRepository';
import { Message } from '../types/database';
import { 
  InputValidator, 
  AIRateLimiter, 
  ResponseValidator,
  ValidationError,
  AIServiceError,
  RateLimitError 
} from '../utils/validation';

/**
 * Chat Service - Orchestrates FAQ retrieval, caching, and AI responses
 */
export class ChatService {
  private rateLimiter: AIRateLimiter;

  constructor() {
    // 10 requests per minute per conversation
    this.rateLimiter = new AIRateLimiter(10, 60000);
  }
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
      role: (msg.sender === 'ai' ? 'assistant' : msg.sender) as 'user' | 'assistant',
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
   * Enhanced with validation, rate limiting, and content moderation
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
      // 1. Validate conversation ID
      const idValidation = InputValidator.validateConversationId(conversationId);
      if (!idValidation.valid) {
        throw new ValidationError(idValidation.error || 'Invalid conversation ID', 'conversationId');
      }

      // 2. Validate and sanitize user message
      const messageValidation = InputValidator.validateChatMessage(userMessage);
      if (!messageValidation.valid) {
        throw new ValidationError(messageValidation.error || 'Invalid message', 'message');
      }

      const sanitizedMessage = InputValidator.sanitizeInput(userMessage);

      // 3. Validate region if provided
      if (options.region) {
        const regionValidation = InputValidator.validateRegion(options.region);
        if (!regionValidation.valid) {
          throw new ValidationError(regionValidation.error || 'Invalid region', 'region');
        }
      }

      // 4. Check rate limit
      const rateLimitCheck = this.rateLimiter.checkLimit(conversationId);
      if (!rateLimitCheck.allowed) {
        throw new RateLimitError(
          `Rate limit exceeded. Please try again in ${rateLimitCheck.resetIn} seconds.`,
          rateLimitCheck.resetIn || 60
        );
      }

      // 5. Content moderation
      const moderation = await aiService.moderateContent(sanitizedMessage);
      if (moderation.flagged) {
        console.warn('⚠️  Flagged content detected:', conversationId);
        throw new ValidationError(
          'Your message contains content that violates our guidelines. Please rephrase and try again.',
          'message'
        );
      }

      // 6. Save user message
      const userMsg = await messageRepository.create({
        conversation_id: conversationId,
        sender: 'user',
        text: sanitizedMessage,
        metadata: {
          region: options.region,
          userId: options.userId,
          timestamp: new Date().toISOString(),
        },
      });

      // 7. Generate AI response with error handling
      let response: string;
      let sources: string[];

      try {
        const result = await this.generateResponse(
          conversationId,
          sanitizedMessage,
          { region: options.region, includeHistory: true }
        );
        response = result.response;
        sources = result.sources;

        // 8. Validate AI response
        const responseValidation = ResponseValidator.validateAIResponse(response);
        if (!responseValidation.valid) {
          throw new AIServiceError(
            'AI generated an invalid response',
            'INVALID_RESPONSE',
            500
          );
        }

        // 9. Check for harmful content in response
        if (ResponseValidator.containsHarmfulContent(response)) {
          console.error('❌ Harmful content detected in AI response');
          response = "I apologize, but I'm unable to provide a response to that query. Please contact our human support team for assistance.";
        }
      } catch (error: any) {
        console.error('❌ AI generation error:', error);
        
        // Fallback response
        response = "I apologize, but I'm experiencing technical difficulties. Please try again in a moment or contact our support team.";
        sources = [];
      }

      // 10. Save AI response
      const aiMsg = await messageRepository.create({
        conversation_id: conversationId,
        sender: 'ai',
        text: response,
        metadata: {
          sources,
          timestamp: new Date().toISOString(),
        },
      });

      // 11. Invalidate message cache
      await cacheService.invalidateConversationCache(conversationId);

      return {
        userMessageId: userMsg.id,
        aiMessageId: aiMsg.id,
        response,
        sources,
      };
    } catch (error: any) {
      // Re-throw known errors
      if (error instanceof ValidationError || 
          error instanceof RateLimitError || 
          error instanceof AIServiceError) {
        throw error;
      }

      console.error('❌ Process chat error:', error);
      throw new AIServiceError(
        `Failed to process chat: ${error.message}`,
        'PROCESS_CHAT_ERROR',
        500
      );
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(title?: string) {
    const conversationTitle = title || 'New Conversation';
    return await conversationRepository.create(conversationTitle);
  }

  /**
   * Get conversation details
   */
  // async getConversation(conversationId: string) {
  //   return await conversationRepository.findById(conversationId);
  // }

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

  /**
   * Get all conversations with preview
   */
  async getAllConversations(limit: number = 50) {
    return await conversationRepository.getAllWithPreview(limit);
  }
}

export default new ChatService();
