import { createClient } from "redis";

let redisClient: any = null;
let isConnecting: any = false;
let connectionPromise: any = null;

export const getRedisClient = async () => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }

  isConnecting = true;
  connectionPromise = (async () => {
    try {
      redisClient = createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379",
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
        },
      });

      redisClient.on("error", (err: any) => {
        console.error("Redis Client Error:", err);
      });

      redisClient.on("connect", () => {
        console.log("✅ Redis connected");
        isConnecting = false;
      });

      redisClient.on("ready", () => {
        console.log("✅ Redis ready for commands");
      });

      redisClient.on("end", () => {
        console.log("🔌 Redis connection ended");
        isConnecting = false;
      });

      await redisClient.connect();
      return redisClient;
    } catch (error) {
      isConnecting = false;
      console.error("Failed to connect to Redis:", error);
      throw error;
    }
  })();

  return connectionPromise;
};

export const getClient = () => redisClient;

export const isRedisConnected = () => {
  return redisClient !== null && redisClient.isOpen === true;
};

export const disconnectRedis = async () => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    console.log("👋 Redis disconnected");
  }
  redisClient = null;
  isConnecting = false;
  connectionPromise = null;
};

(async () => {
  if (process.env.REDIS_AUTO_CONNECT !== "false") {
    try {
      await getRedisClient();
    } catch (error) {
      console.log("Redis auto-connect failed (will retry on first use)");
    }
  }
})();

export default { getRedisClient, getClient, isRedisConnected, disconnectRedis };
