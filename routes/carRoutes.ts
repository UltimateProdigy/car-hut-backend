import { Router } from "express";
import { carController } from "../controllers/carController";
import { requireRoles } from "../middleware/requireRoles";
import { Role } from "@prisma/client";
import { smartCache } from "../middleware/cache-middleware";

const router = Router();

router.get("/active-auctions", carController.getActiveAuctions);
router.get(
  "/user/my-listings",
  requireRoles([Role.USER, Role.ADMIN]),
  carController.getMyListings
);
router.get("/", smartCache(), carController.getCars);
router.get("/:id", smartCache(), carController.getCarById);
router.post(
  "/",
  requireRoles([Role.USER, Role.ADMIN]),
  carController.createCar
);
router.put(
  "/:id",
  requireRoles([Role.USER, Role.ADMIN]),
  carController.updateCar
);
router.delete(
  "/:id",
  requireRoles([Role.USER, Role.ADMIN]),
  carController.deleteCar
);

export { router as carRoutes };
