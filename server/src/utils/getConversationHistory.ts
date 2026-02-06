import { Message } from "../types";
import { cacheMessageHistory, getCachedMessageHistory } from "./getCachedFAQSearch";
import { getRecentMessages } from "./getRecentMessages";

export async function getConversationHistory(conversationId: string, limit: number = 10): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
    // Try cache first
    const cached = await getCachedMessageHistory(conversationId);
    
    if (cached) {
      console.log('✅ Message history cache hit');
      return cached.slice(-limit);
    }

    // Get from database
    const messages = await getRecentMessages(conversationId, limit);

    const history = messages.map((msg: Message) => ({
      role: msg.sender === 'ai' ? 'assistant' : 'user' as 'user' | 'assistant',
      content: msg.text,
    }));

    // Cache the history
    await cacheMessageHistory(conversationId, history);

    return history;
  }