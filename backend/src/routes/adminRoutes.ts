import { Router } from "express";
import { deletePrediction, deleteUser, getSystemConfig, listPredictions, listUsers, patchSystemConfig, systemStatus, updateUser } from "../controllers/adminController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireAdmin);
router.get("/config", getSystemConfig);
router.patch("/config", patchSystemConfig);
router.get("/status", systemStatus);
router.get("/users", listUsers);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/predictions", listPredictions);
router.delete("/predictions/:id", deletePrediction);
export default router;
