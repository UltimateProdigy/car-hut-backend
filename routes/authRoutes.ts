import { Router } from "express";
import { authController } from "../controllers/authController";
import { requireRoles } from "../middleware/requireRoles";
import { Role } from "@prisma/client";
import { redisRateLimiter } from "../middleware/rate-limiter";

const router = Router();

router.post("/register", authController.register);
router.post(
  "/login",
  redisRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: "Too many login attempts, please try again in 15 minutes",
    keyGenerator: (req) => req.body.email || req.ip,
  }),
  authController.login
);

router.post(
  "/staff/register",
  requireRoles([Role.ADMIN]),
  authController.registerStaff
);
router.post(
  "/staff/login",
  redisRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: "Too many login attempts, please try again in 15 minutes",
    keyGenerator: (req) => req.body.email || req.ip,
  }),
  authController.loginStaff
);

router.get(
  "/me",
  requireRoles([Role.ADMIN, Role.USER]),
  authController.getCurrentUser
);

export { router as authRoutes };
