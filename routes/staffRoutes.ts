import { Router } from "express";
import { staffController } from "../controllers/staffController";
import { requireRoles } from "../middleware/requireRoles";
import { Role } from "@prisma/client";

const router = Router();

router.use(requireRoles([Role.ADMIN]));

router.get("/", staffController.getAllStaff);
router.get("/:id", staffController.getStaffById);
router.put("/:id", staffController.updateStaff);
router.delete("/:id", staffController.deleteStaff);

export { router as staffRoutes };
