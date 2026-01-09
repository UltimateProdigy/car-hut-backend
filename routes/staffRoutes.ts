import { Router } from "express";
import { staffController } from "../controllers/staffController";
import { requireRoles } from "../middleware/requireRoles";
import { Role } from "@prisma/client";
import { smartCache } from "../middleware/cache-middleware";

const router = Router();

router.use(requireRoles([Role.ADMIN]));

router.get("/", staffController.getAllStaff);
router.get("/:id", smartCache(), staffController.getStaffById);
router.put("/:id", staffController.updateStaff);
router.delete("/:id", staffController.deleteStaff);

export { router as staffRoutes };
