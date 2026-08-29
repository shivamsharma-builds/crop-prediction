import { Router } from "express";
import { createPrediction, getSiteData, myPredictions } from "../controllers/predictionController.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/site-data", getSiteData);

// Crop prediction is intentionally available without an account.
// Creating an account is optional and is used for saved prediction history.
router.post("/", optionalAuth, createPrediction);

router.get("/mine", requireAuth, myPredictions);

export default router;
