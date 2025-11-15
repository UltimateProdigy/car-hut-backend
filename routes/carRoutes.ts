import { Router } from "express";
import { carController } from "../controllers/carController";
import { requireRoles } from "../middleware/requireRoles";
import { Role } from "@prisma/client";

const router = Router();

router.post(
  "/",
  requireRoles([Role.USER, Role.ADMIN]),
  carController.createCar
);
router.get("/", requireRoles([Role.USER, Role.ADMIN]), carController.getCars);
router.get(
  "/:id",
  requireRoles([Role.USER, Role.ADMIN]),
  carController.getCarById
);

export { router as carRoutes };
