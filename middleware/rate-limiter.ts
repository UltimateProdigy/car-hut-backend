import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { getRedisClient } from "../utils/redis-client";

interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  maxRequests?: number; // Max requests per window
  message?: string; // Error message
  keyGenerator?: (req: AuthenticatedRequest) => string; // Custom key function
  skipSuccessfulRequests?: boolean; // Only count failed requests?
}

export const redisRateLimiter = (options: RateLimitOptions = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    maxRequests = 100,
    message = "Too many requests, please try again later",
    keyGenerator = (req) => req.user?.id || req.ip || "anonymous",
    skipSuccessfulRequests = false,
  } = options;

  const windowSeconds = Math.floor(windowMs / 1000);

  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const redisClient = await getRedisClient();
      const identifier = keyGenerator(req);
      const key = `ratelimit:${identifier}`;

      const current = await redisClient.incr(key);

      if (current === 1) {
        await redisClient.expire(key, windowSeconds);
      }

      if (current > maxRequests) {
        const ttl = await redisClient.ttl(key);
        res.status(429).json({
          status: false,
          error: "Too Many Requests",
          message,
          retryAfter: ttl,
          limit: maxRequests,
          current,
        });
        return;
      }

      const remaining = Math.max(0, maxRequests - current);
      const ttl = await redisClient.ttl(key);

      res.setHeader("X-RateLimit-Limit", maxRequests.toString());
      res.setHeader("X-RateLimit-Remaining", remaining.toString());
      res.setHeader("X-RateLimit-Reset", (Date.now() + ttl * 1000).toString());

      if (skipSuccessfulRequests) {
        const originalJson = res.json.bind(res);

        res.json = function (body: any) {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            redisClient
              .decr(key)
              .then(() => console.log(`✅ Success - decremented ${key}`))
              .catch((err: any) => console.error("Decrement error:", err));
          }
          return originalJson(body);
        };
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
