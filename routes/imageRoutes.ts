import { Router } from "express";
import { deleteImage, getUploadSignature } from "../controllers/upload";
import { requireRoles } from "../middleware/requireRoles";
import { Role } from "@prisma/client";

const router = Router();

router.delete("/", requireRoles([Role.ADMIN]), deleteImage);
router.post(
  "/get-upload-signature",
  requireRoles([Role.USER]),
  getUploadSignature
);

export { router as imageRoutes };
