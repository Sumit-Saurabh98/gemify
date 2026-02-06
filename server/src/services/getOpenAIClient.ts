import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// OpenAI client instance
let openaiClient: OpenAI | null = null;

/**
 * Get or create OpenAI client
 */
export function getOpenAIClient(): OpenAI {
  if (openaiClient) {
    return openaiClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }

  openaiClient = new OpenAI({
    apiKey: apiKey,
  });

  console.log('✅ OpenAI client initialized');

  return openaiClient;
}