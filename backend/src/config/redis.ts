import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Redis client instance
let redisClient: RedisClientType | null = null;

/**
 * Get or create Redis client
 */
export async function getRedisClient(): Promise<RedisClientType> {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries: number) => {
        // Exponential backoff with max 3 seconds
        const delay = Math.min(retries * 100, 3000);
        console.log(`🔄 Redis reconnecting... attempt ${retries}, delay: ${delay}ms`);
        return delay;
      },
    },
  });

  // Connect to Redis
  try {
    await redisClient.connect();
    console.log('✅ Redis client connected');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    throw error;
  }

  return redisClient;
}

/**
 * Check Redis health
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const pong = await client.ping();
    console.log('✅ Redis health check:', pong);
    return pong === 'PONG';
  } catch (error) {
    console.error('❌ Redis health check failed:', error);
    return false;
  }
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
    console.log('🔌 Redis connection closed');
  }
}

/**
 * Force disconnect (for emergency shutdown)
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.disconnect();
    redisClient = null;
    console.log('⚠️  Redis forcefully disconnected');
  }
}

export default {
  getClient: getRedisClient,
  checkHealth: checkRedisHealth,
  close: closeRedis,
  disconnect: disconnectRedis,
};
