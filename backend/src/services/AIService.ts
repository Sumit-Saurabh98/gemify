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

Your role:
- Help customers with questions about products, shipping, returns, payments, and support
- Provide accurate, clear, and definitive answers
- Be concise, friendly, and professional
- Always give specific information when you know it
- For shipping questions: We ONLY ship to USA, India, Japan, and China. If asked about other countries, clearly state this
- If the FAQ context doesn't contain relevant information, make reasonable inferences based on common e-commerce practices, but clearly state when you're being general

CRITICAL RULES:
1. DO NOT say "I don't have that information" for common questions you should know
2. DO be specific and direct with your answers
3. For shipping regions: If asked about a country NOT in our list (USA, India, Japan, China), respond: "Currently, we only ship to USA, India, Japan, and China. Unfortunately, we don't ship to [country] at this time."
4. Use the FAQ context when available, but don't be overly cautious - you're a knowledgeable support agent
5. Only suggest contacting human support for complex account-specific issues or problems you genuinely cannot help with

Store regions: USA, India, Japan, China (these are the ONLY countries we ship to)

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
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const client = getOpenAIClient();
      
      const response = await client.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error: any) {
      console.error('❌ OpenAI embedding error:', error);
      throw new Error(`Embedding generation error: ${error.message || 'Unknown error'}`);
    }
  }

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
