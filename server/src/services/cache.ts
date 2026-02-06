import getRedisClient from './getRedisClient';

const redis = getRedisClient;

// Cache key patterns
const CONVERSATION_CACHE_PREFIX = 'conversation:';
const CACHE_TTL = 60 * 60; // 1 hour cache TTL
const PENDING_UPDATE_PREFIX = 'pending_update:';

// Cache conversation messages
export const cacheConversationMessages = async (conversationId: string, messages: any[]) => {
  try {
    const key = `${CONVERSATION_CACHE_PREFIX}${conversationId}`;
    await redis.setex(key, CACHE_TTL, JSON.stringify(messages));
    console.log(`✅ Cached conversation ${conversationId} with ${messages.length} messages`);
  } catch (error) {
    console.error('❌ Failed to cache conversation:', error);
  }
};

// Get cached conversation messages
export const getCachedConversationMessages = async (conversationId: string) => {
  try {
    const key = `${CONVERSATION_CACHE_PREFIX}${conversationId}`;
    const cached = await redis.get(key);
    if (cached) {
      console.log(`✅ Retrieved cached messages for conversation ${conversationId}`);
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.error('❌ Failed to get cached conversation:', error);
    return null;
  }
};

// Invalidate conversation cache
export const invalidateConversationCache = async (conversationId: string) => {
  try {
    const key = `${CONVERSATION_CACHE_PREFIX}${conversationId}`;
    await redis.del(key);
    console.log(`❌ Invalidated cache for conversation ${conversationId}`);
  } catch (error) {
    console.error('❌ Failed to invalidate conversation cache:', error);
  }
};

// Mark conversation as having a pending update
export const markPendingUpdate = async (conversationId: string) => {
  try {
    const key = `${PENDING_UPDATE_PREFIX}${conversationId}`;
    await redis.setex(key, 120, '1'); // 2 minutes
    console.log(`⏳ Marked conversation ${conversationId} as pending update`);
  } catch (error) {
    console.error('❌ Failed to mark pending update:', error);
  }
};

// Check if conversation has pending updates
export const hasPendingUpdate = async (conversationId: string) => {
  try {
    const key = `${PENDING_UPDATE_PREFIX}${conversationId}`;
    const pending = await redis.get(key);
    return pending !== null;
  } catch (error) {
    console.error('❌ Failed to check pending update:', error);
    return false;
  }
};

// Remove pending update marker
export const removePendingUpdate = async (conversationId: string) => {
  try {
    const key = `${PENDING_UPDATE_PREFIX}${conversationId}`;
    await redis.del(key);
    console.log(`✅ Removed pending update marker for conversation ${conversationId}`);
  } catch (error) {
    console.error('❌ Failed to remove pending update:', error);
  }
};

// Cache all conversations on app load
export const warmConversationCache = async (conversations: any[] = []) => {
  try {
    console.log('🔥 Starting conversation cache warming...');
    
    if (conversations.length === 0) {
      console.log('🔥 No conversations provided for cache warming');
      return;
    }
    
    // Cache messages for each conversation
    for (const conversation of conversations) {
      try {
        // This would need to be implemented to fetch and cache messages
        // For now, we'll just log that we're processing each conversation
        console.log(`🔥 Processing cache warming for conversation ${conversation.id}`);
      } catch (error) {
        console.error(`❌ Failed to warm cache for conversation ${conversation.id}:`, error);
      }
    }
    
    console.log('🔥 Conversation cache warming completed');
  } catch (error) {
    console.error('❌ Failed to warm conversation cache:', error);
  }
};

// Check if we should cache a conversation after delay
export const shouldCacheAfterDelay = async (conversationId: string) => {
  return await hasPendingUpdate(conversationId);
};