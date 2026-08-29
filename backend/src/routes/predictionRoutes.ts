import { Router } from "express";
import { createPrediction, myPredictions } from "../controllers/predictionController.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";

const router = Router();

// Crop prediction is intentionally available without an account.
// Creating an account is optional and is used for saved prediction history.
router.post("/", optionalAuth, createPrediction);

router.get("/mine", requireAuth, myPredictions);

export default router;
