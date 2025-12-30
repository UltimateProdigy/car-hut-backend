import { Router } from "express";
import { bidController } from "../controllers/bidController";
import { requireRoles } from "../middleware/requireRoles";
import { Role } from "@prisma/client";

const router = Router();

router.get("/car/:carId", bidController.getBidsByCar);

router.get("/car/:carId/highest", bidController.getHighestBid);

router.get("/car/:carId/statistics", bidController.getBidStatistics);

router.post(
  "/car/:carId",
  requireRoles([Role.USER, Role.ADMIN]),
  bidController.placeBid
);

router.get(
  "/my-bids",
  requireRoles([Role.USER, Role.ADMIN]),
  bidController.getMyBids
);

router.get(
  "/my-winning-bids",
  requireRoles([Role.USER, Role.ADMIN]),
  bidController.getMyWinningBids
);

router.get(
  "/car/:carId/check",
  requireRoles([Role.USER, Role.ADMIN]),
  bidController.checkUserBid
);

router.post(
  "/car/:carId/close",
  requireRoles([Role.ADMIN]),
  bidController.closeAuction
);

export { router as bidRoutes };