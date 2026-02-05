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

/**
 * Check OpenAI client configuration
 */
export function checkOpenAIConfig(): boolean {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY not configured');
      return false;
    }
    
    if (apiKey === 'your_openai_api_key_here') {
      console.error('❌ OPENAI_API_KEY is set to placeholder value');
      return false;
    }
    
    console.log('✅ OpenAI configuration valid');
    return true;
  } catch (error) {
    console.error('❌ OpenAI configuration check failed:', error);
    return false;
  }
}

/**
 * Test OpenAI connection
 */
export async function testOpenAIConnection(): Promise<boolean> {
  try {
    const client = getOpenAIClient();
    
    // Simple test call to list models
    const models = await client.models.list();
    
    if (models.data && models.data.length > 0) {
      console.log('✅ OpenAI connection successful');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ OpenAI connection test failed:', error);
    return false;
  }
}

export default {
  getClient: getOpenAIClient,
  checkConfig: checkOpenAIConfig,
  testConnection: testOpenAIConnection,
};
