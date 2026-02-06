import { getOpenAIClient } from '../config/openai';

/**
 * AI Service for managing OpenAI interactions
 */
export class AIService {
  /**
   * Generate chat completion using GPT model
   */
  async generateChatCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<string> {
    try {
      const client = getOpenAIClient();
      
      const completion = await client.chat.completions.create({
        model: options.model || 'gpt-3.5-turbo',
        messages: messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens || 500,
        stream: false, // Explicitly disable streaming
      });

      return completion.choices[0]?.message?.content || 'No response generated';
    } catch (error: any) {
      console.error('❌ OpenAI chat completion error:', error);
      
      if (error.code === 'insufficient_quota') {
        throw new Error('OpenAI API quota exceeded. Please check your billing.');
      }
      
      if (error.code === 'invalid_api_key') {
        throw new Error('Invalid OpenAI API key.');
      }
      
      throw new Error(`AI service error: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Generate a response for the gaming store support chatbot
   */
  async generateSupportResponse(
    userMessage: string,
    context: string,
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    const systemPrompt = `You are a helpful and friendly customer support AI for GamerHub, an online gaming accessories store. 

Your ONLY role is to help with GamerHub store-related questions:
- Products (gaming mice, keyboards, headsets, controllers, etc.)
- Shipping (to USA, India, Japan, China only)
- Returns and refunds
- Payment methods
- Order tracking
- Product recommendations
- Store policies

STAY ON TOPIC:
If a customer asks about ANYTHING not related to GamerHub store (programming, general knowledge, other topics), politely redirect them:
"I'm here to help with questions about GamerHub store - our gaming products, shipping, returns, and orders. How can I assist you with your shopping today?"

CRITICAL RULES:
1. ONLY answer questions related to GamerHub store and e-commerce
2. DO NOT answer general knowledge questions, tech questions, or off-topic queries
3. Be specific and direct with store-related answers
4. For shipping: We ONLY ship to USA, India, Japan, and China
5. If asked about unsupported countries: "Currently, we only ship to USA, India, Japan, and China. Unfortunately, we don't ship to [country] at this time."
6. Use FAQ context when available, make reasonable e-commerce inferences otherwise
7. Only suggest human support for complex account-specific issues

Store regions: USA, India, Japan, China (ONLY shipping destinations)

FAQ Context:
${context}`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history if provided (limited to last 5 exchanges)
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-10); // Last 10 messages (5 exchanges)
      messages.push(...recentHistory);
    }

    // Add current user message
    messages.push({ role: 'user', content: userMessage });

    return await this.generateChatCompletion(messages, {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 500,
    });
  }

  /**
   * Generate embeddings for text (for semantic search - future enhancement)
   */
 
  /**
   * Moderate content for safety
   */
  async moderateContent(text: string): Promise<{
    flagged: boolean;
    categories: Record<string, boolean>;
  }> {
    try {
      const client = getOpenAIClient();
      
      const moderation = await client.moderations.create({
        input: text,
      });

      const result = moderation.results[0];

      return {
        flagged: result.flagged,
        categories: result.categories as unknown as Record<string, boolean>,
      };
    } catch (error: any) {
      console.error('❌ OpenAI moderation error:', error);
      // Return safe default if moderation fails
      return {
        flagged: false,
        categories: {},
      };
    }
  }
}

export default new AIService();
