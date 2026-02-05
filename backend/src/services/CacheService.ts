import { getRedisClient } from '../config/redis';
import { FAQKnowledge } from '../types/database';

/**
 * Cache TTL (Time To Live) in seconds
 */
const CACHE_TTL = {
  FAQ_SEARCH: 3600, // 1 hour
  FAQ_CATEGORY: 7200, // 2 hours
  FAQ_ALL: 1800, // 30 minutes
  CONVERSATION: 3600, // 1 hour
  MESSAGE_HISTORY: 900, // 15 minutes
};

/**
 * Cache key prefixes
 */
const CACHE_PREFIX = {
  FAQ_SEARCH: 'faq:search:',
  FAQ_CATEGORY: 'faq:category:',
  FAQ_REGION: 'faq:region:',
  FAQ_ALL: 'faq:all',
  CONVERSATION: 'conversation:',
  MESSAGE_HISTORY: 'messages:',
};

export class CacheService {
  /**
   * Generic get from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const client = await getRedisClient();
      const data = await client.get(key);
      
      if (!data) {
        return null;
      }
      
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Generic set to cache with TTL
   */
  async set(key: string, value: any, ttl: number): Promise<boolean> {
    try {
      const client = await getRedisClient();
      await client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const client = await getRedisClient();
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const client = await getRedisClient();
      const keys = await client.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }
      
      await client.del(keys);
      return keys.length;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return 0;
    }
  }

  /**
   * Cache FAQ search results
   */
  async cacheFAQSearch(keyword: string, region: string | undefined, results: FAQKnowledge[]): Promise<void> {
    const key = `${CACHE_PREFIX.FAQ_SEARCH}${keyword}:${region || 'global'}`;
    await this.set(key, results, CACHE_TTL.FAQ_SEARCH);
  }

  /**
   * Get cached FAQ search results
   */
  async getCachedFAQSearch(keyword: string, region: string | undefined): Promise<FAQKnowledge[] | null> {
    const key = `${CACHE_PREFIX.FAQ_SEARCH}${keyword}:${region || 'global'}`;
    return await this.get<FAQKnowledge[]>(key);
  }

  /**
   * Cache FAQ by category
   */
  async cacheFAQByCategory(category: string, region: string | undefined, results: FAQKnowledge[]): Promise<void> {
    const key = `${CACHE_PREFIX.FAQ_CATEGORY}${category}:${region || 'global'}`;
    await this.set(key, results, CACHE_TTL.FAQ_CATEGORY);
  }

  /**
   * Get cached FAQ by category
   */
  async getCachedFAQByCategory(category: string, region: string | undefined): Promise<FAQKnowledge[] | null> {
    const key = `${CACHE_PREFIX.FAQ_CATEGORY}${category}:${region || 'global'}`;
    return await this.get<FAQKnowledge[]>(key);
  }

  /**
   * Cache FAQ by region
   */
  async cacheFAQByRegion(region: string, results: FAQKnowledge[]): Promise<void> {
    const key = `${CACHE_PREFIX.FAQ_REGION}${region}`;
    await this.set(key, results, CACHE_TTL.FAQ_CATEGORY);
  }

  /**
   * Get cached FAQ by region
   */
  async getCachedFAQByRegion(region: string): Promise<FAQKnowledge[] | null> {
    const key = `${CACHE_PREFIX.FAQ_REGION}${region}`;
    return await this.get<FAQKnowledge[]>(key);
  }

  /**
   * Cache all FAQs
   */
  async cacheAllFAQs(results: FAQKnowledge[]): Promise<void> {
    await this.set(CACHE_PREFIX.FAQ_ALL, results, CACHE_TTL.FAQ_ALL);
  }

  /**
   * Get all cached FAQs
   */
  async getCachedAllFAQs(): Promise<FAQKnowledge[] | null> {
    return await this.get<FAQKnowledge[]>(CACHE_PREFIX.FAQ_ALL);
  }

  /**
   * Invalidate all FAQ caches
   */
  async invalidateFAQCache(): Promise<void> {
    await this.deletePattern('faq:*');
    console.log('✅ All FAQ caches invalidated');
  }

  /**
   * Cache conversation data
   */
  async cacheConversation(conversationId: string, data: any): Promise<void> {
    const key = `${CACHE_PREFIX.CONVERSATION}${conversationId}`;
    await this.set(key, data, CACHE_TTL.CONVERSATION);
  }

  /**
   * Get cached conversation
   */
  async getCachedConversation(conversationId: string): Promise<any | null> {
    const key = `${CACHE_PREFIX.CONVERSATION}${conversationId}`;
    return await this.get(key);
  }

  /**
   * Cache message history
   */
  async cacheMessageHistory(conversationId: string, messages: any[]): Promise<void> {
    const key = `${CACHE_PREFIX.MESSAGE_HISTORY}${conversationId}`;
    await this.set(key, messages, CACHE_TTL.MESSAGE_HISTORY);
  }

  /**
   * Get cached message history
   */
  async getCachedMessageHistory(conversationId: string): Promise<any[] | null> {
    const key = `${CACHE_PREFIX.MESSAGE_HISTORY}${conversationId}`;
    return await this.get<any[]>(key);
  }

  /**
   * Invalidate conversation cache
   */
  async invalidateConversationCache(conversationId: string): Promise<void> {
    await this.delete(`${CACHE_PREFIX.CONVERSATION}${conversationId}`);
    await this.delete(`${CACHE_PREFIX.MESSAGE_HISTORY}${conversationId}`);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalKeys: number;
    faqKeys: number;
    conversationKeys: number;
    messageKeys: number;
  }> {
    try {
      const client = await getRedisClient();
      
      const [allKeys, faqKeys, conversationKeys, messageKeys] = await Promise.all([
        client.keys('*'),
        client.keys('faq:*'),
        client.keys('conversation:*'),
        client.keys('messages:*'),
      ]);
      
      return {
        totalKeys: allKeys.length,
        faqKeys: faqKeys.length,
        conversationKeys: conversationKeys.length,
        messageKeys: messageKeys.length,
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return {
        totalKeys: 0,
        faqKeys: 0,
        conversationKeys: 0,
        messageKeys: 0,
      };
    }
  }

  /**
   * Clear all cache
   */
  async clearAllCache(): Promise<void> {
    try {
      const client = await getRedisClient();
      await client.flushDb();
      console.log('✅ All cache cleared');
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

export default new CacheService();
