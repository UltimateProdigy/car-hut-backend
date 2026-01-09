import { Response, NextFunction } from "express";
import { getRedisClient } from "../utils/redis-client";
import { AuthenticatedRequest } from "../types";

interface CacheOptions {
  ttl?: number;
  prefix?: string;
  varyByUser?: boolean;
  varyByQuery?: boolean;
}

export const invalidateCache = (...patterns: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const redisClient = await getRedisClient();

      for (const pattern of patterns) {
        const keys = await redisClient.keys(`cache:${pattern}*`);
        if (keys.length > 0) {
          await redisClient.del(keys);
          console.log(
            `🗑️ Invalidated ${keys.length} cache keys matching: ${pattern}`
          );
        }
      }
      next();
    } catch (error) {
      console.error("Cache invalidation error:", error);
      next();
    }
  };
};

export const smartCache = (
  options: CacheOptions & {
    excludeParams?: string[];
    varyByHeaders?: string[];
  } = {}
) => {
  const {
    ttl = 3600,
    prefix = "cache",
    varyByUser = false,
    varyByQuery = true,
    excludeParams = [],
    varyByHeaders = [],
  } = options;

  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (req.method !== "GET") {
      return next();
    }

    try {
      const redisClient = await getRedisClient();

      let cacheKeyParts = [prefix, req.path];

      if (varyByUser && req.user?.id) {
        cacheKeyParts.push(`user:${req.user.id}`);
      }

      if (varyByQuery) {
        const queryParams = { ...req.query };
        excludeParams.forEach((param) => delete queryParams[param]);

        const queryString = new URLSearchParams(
          queryParams as Record<string, string>
        ).toString();
        if (queryString) {
          cacheKeyParts.push(queryString);
        }
      }

      varyByHeaders.forEach((header) => {
        const value = req.get(header);
        if (value) {
          cacheKeyParts.push(`${header}:${value}`);
        }
      });

      const cacheKey = cacheKeyParts.join(":");

      const cached = await redisClient.get(cacheKey);

      if (cached) {
        console.log(`⚡ Cache HIT: ${cacheKey}`);
        res.status(200).json({
          ...JSON.parse(cached),
        });
        return;
      }

      console.log(`🔍 Cache MISS: ${cacheKey}`);

      const originalJson = res.json.bind(res);

      res.json = function (body: any) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient
            .setEx(cacheKey, ttl, JSON.stringify(body))
            .catch((err: any) => console.error("Smart cache error:", err));
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error("Smart cache error:", error);
      next();
    }
  };
};
