import { Response, NextFunction } from "express";
import { getRedisClient } from "../utils/redis-client";
import { AuthenticatedRequest } from "../types";
import { createHash } from "crypto";

interface IdempotencyOptions {
  ttl?: number;
  headerName?: string;
  skipMethods?: string[];
  generateKey?: boolean;
  keyFields?: string[];
}

interface CachedResponse {
  statusCode: number;
  body: any;
  timestamp: string;
}

const generateKeyFromRequest = (
  req: AuthenticatedRequest,
  fields?: string[]
): string => {
  const data: any = {
    userId: req.user?.id,
    method: req.method,
    path: req.path,
  };

  if (fields && fields.length > 0) {
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
      }
    });
  } else {
    data.body = req.body;
  }

  const hash = createHash("sha256").update(JSON.stringify(data)).digest("hex");
  return hash;
};

export const idempotency = (options: IdempotencyOptions = {}) => {
  const {
    ttl = 86400,
    headerName = "idempotency-key",
    skipMethods = ["GET", "HEAD", "OPTIONS"],
    generateKey = true,
    keyFields,
  } = options;

  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (skipMethods.includes(req.method)) {
        return next();
      }

      const redisClient = await getRedisClient();

      let idempotencyKey: string | undefined;

      idempotencyKey =
        (req.headers[headerName] as string) ||
        req.body?.idempotencyKey ||
        req.body?.requestId;

      if (!idempotencyKey && generateKey) {
        idempotencyKey = generateKeyFromRequest(req, keyFields);
        console.log(
          `🔑 Generated idempotency key: ${idempotencyKey.substring(0, 16)}...`
        );
      }

      const cacheKey = `idempotency:${req.method}:${req.path}:${idempotencyKey}`;
      const cachedResponse = await redisClient.get(cacheKey);

      if (cachedResponse) {
        console.log(
          `🔁 Idempotent request detected: ${idempotencyKey?.substring(
            0,
            16
          )}...`
        );
        const parsed: CachedResponse = JSON.parse(cachedResponse);

        res.status(parsed.statusCode).json({
          ...parsed.body,
          idempotent: true,
          message: "Request already processed",
          originalProcessedAt: parsed.timestamp,
        });
        return;
      }

      console.log(
        `✨ New idempotency key: ${idempotencyKey?.substring(0, 16)}...`
      );

      const originalJson = res.json.bind(res);
      const originalStatus = res.status.bind(res);
      let statusCode = 200;

      res.status = function (code: number) {
        statusCode = code;
        return originalStatus(code);
      };

      res.json = function (body: any) {
        if (statusCode >= 200 && statusCode < 300) {
          const responseToCache: CachedResponse = {
            statusCode,
            body,
            timestamp: new Date().toISOString(),
          };

          redisClient
            .setEx(cacheKey, ttl, JSON.stringify(responseToCache))
            .then(() =>
              console.log(
                `💾 Idempotency cached: ${cacheKey.substring(0, 50)}...`
              )
            )
            .catch((err: any) =>
              console.error("Idempotency cache error:", err)
            );
        }

        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error("Idempotency middleware error:", error);
      res.status(500).json({
        status: false,
        message: "Idempotency check failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
};
