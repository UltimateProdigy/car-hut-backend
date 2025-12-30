import { Router } from "express";
import { carController } from "../controllers/carController";
import { requireRoles } from "../middleware/requireRoles";
import { Role } from "@prisma/client";

const router = Router();

router.get("/active-auctions", carController.getActiveAuctions);
router.get(
  "/user/my-listings",
  requireRoles([Role.USER, Role.ADMIN]),
  carController.getMyListings
);
router.get("/", carController.getCars);
router.get("/:id", carController.getCarById);
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
