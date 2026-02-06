import getRedisClient from "../services/getRedisClient";
import { Faqs } from "../types";
import prisma from "../lib/prisma";

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
  FAQ_SEARCH: "faq:search:",
  FAQ_CATEGORY: "faq:category:",
  FAQ_REGION: "faq:region:",
  FAQ_ALL: "faq:all",
  CONVERSATION: "conversation:",
  MESSAGE_HISTORY: "messages:",
};

export async function get<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient;
    const data = await client.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as T;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
}

export async function getCachedFAQSearch(
  keyword: string,
): Promise<Faqs[] | null> {
  const key = `${CACHE_PREFIX.FAQ_SEARCH}${keyword}`;
  return await get<Faqs[]>(key);
}

export function formatFAQContext(faqs: any[]): string {
  if (faqs.length === 0) {
    return "No relevant FAQ information found.";
  }

  return faqs
    .map((faq, index) => {
      return `${index + 1}. Category: ${faq.category}\nQ: ${faq.question}\nA: ${faq.answer}`;
    })
    .join("\n\n");
}

export async function set(
  key: string,
  value: any,
  ttl: number,
): Promise<boolean> {
  try {
    const client = getRedisClient;
    await client.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Cache set error:", error);
    return false;
  }
}

 export async function deleteCache(key: string): Promise<boolean> {
    try {
      const client = getRedisClient;
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

export async function cacheFAQSearch(
  keyword: string,
  results: Faqs[],
): Promise<void> {
  const key = `${CACHE_PREFIX.FAQ_SEARCH}${keyword}`;
  await set(key, results, CACHE_TTL.FAQ_SEARCH);
}

export async function getCachedMessageHistory(
  conversationId: string,
): Promise<Array<{ role: 'user' | 'assistant'; content: string }> | null> {
  const key = `${CACHE_PREFIX.MESSAGE_HISTORY}${conversationId}`;
  return await get<Array<{ role: 'user' | 'assistant'; content: string }>>(key);
}

export async function cacheMessageHistory(conversationId: string, messages: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<void> {
    const key = `${CACHE_PREFIX.MESSAGE_HISTORY}${conversationId}`;
    await set(key, messages, CACHE_TTL.MESSAGE_HISTORY);
  }

  export async function invalidateConversationCache(conversationId: string): Promise<void> {
    await deleteCache(`${CACHE_PREFIX.CONVERSATION}${conversationId}`);
    await deleteCache(`${CACHE_PREFIX.MESSAGE_HISTORY}${conversationId}`);
  }

export async function search(keyword: string): Promise<Faqs[]> {
  try {
    const whereClause: any = {
      question: {
        contains: keyword,
        mode: "insensitive",
      },
    };
    const results = await prisma.faqs.findMany({
      where: whereClause,
    });
    return results.map((faq) => ({
      id: faq.id,
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      created_at: faq.createdAt,
    }));
  } catch (error) {
    console.error("Error searching FAQs:", error);
    return [];
  }
}
