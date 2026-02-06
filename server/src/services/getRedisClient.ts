import Redis from "ioredis";
import dotenv from "dotenv"
dotenv.config();

const REDIS_CONNECTION_STRING = process.env.REDIS_URL

const getRedisClient = new Redis(REDIS_CONNECTION_STRING as string, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    return err.message.includes(targetError);
  }
});

getRedisClient.on("connect", () => {
  console.log("✅ Connected to Redis");
});

getRedisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

export default getRedisClient;
