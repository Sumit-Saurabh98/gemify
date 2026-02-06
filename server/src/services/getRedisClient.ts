import Redis from "ioredis";
import dotenv from "dotenv"
dotenv.config();

const REDIS_CONNECTION_STRING = process.env.REDIS_URL

const getRedisClient = new Redis(REDIS_CONNECTION_STRING as string);

getRedisClient.on("connect", () => {
  console.log("✅ Connected to Redis");
});

getRedisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

export default getRedisClient;