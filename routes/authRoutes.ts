import { Router } from "express";
import { authController } from "../controllers/authController";
import { requireRoles } from "../middleware/requireRoles";
import { Role } from "@prisma/client";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

router.post(
  "/staff/register",
  requireRoles([Role.ADMIN]),
  authController.registerStaff
);
router.post("/staff/login", authController.loginStaff);

router.get(
  "/me",
  requireRoles([Role.ADMIN, Role.USER]),
  authController.getCurrentUser
);

export { router as authRoutes };
