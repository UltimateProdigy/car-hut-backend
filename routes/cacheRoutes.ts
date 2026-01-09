import express from "express";
import { getRedisClient } from "../utils/redis-client";
import { requireRoles } from "../middleware/requireRoles";
import { Role } from "@prisma/client";

const router = express.Router();

router.delete(
  "/clear",
  requireRoles([Role.USER, Role.ADMIN]),
  async (req, res) => {
    try {
      const redisClient = await getRedisClient();
      await redisClient.flushAll();

      console.log("🗑️ All Redis cache cleared");
      res.json({
        success: true,
        message: "Cache cleared successfully",
      });
    } catch (error: any) {
      console.error("Error clearing cache:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

export { router as cacheRoutes };
