import { Router } from "express";
import { userController } from "../controllers/userController";
import { requireRoles } from "../middleware/requireRoles";
import { Role } from "@prisma/client";

const router = Router();

router.get(
  "/profile",
  requireRoles([Role.ADMIN, Role.USER]),
  userController.getMyProfile
);

router.get(
  "/statistics",
  requireRoles([Role.ADMIN, Role.USER]),
  userController.getUserStatistics
);

router.post(
  "/change-password",
  requireRoles([Role.USER]),
  userController.changePassword
);

router.put(
  "/:id",
  requireRoles([Role.USER]),
  userController.updateUser
);

router.delete(
  "/:id",
  requireRoles([Role.ADMIN]),
  userController.deleteUser
);

router.get("/", requireRoles([Role.ADMIN]), userController.getAllUsers);
router.get("/:id", requireRoles([Role.ADMIN]), userController.getUserById);

export { router as userRoutes };
