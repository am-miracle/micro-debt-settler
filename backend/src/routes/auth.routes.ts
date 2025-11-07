import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { authValidators } from "../utils/validators";
import { authRateLimit } from "../middleware/rateLimit.middleware";

const router = Router();

// Public routes
router.post(
  "/register",
  authRateLimit,
  validate(authValidators.register),
  authController.register,
);
router.post(
  "/login",
  authRateLimit,
  validate(authValidators.login),
  authController.login,
);
router.post(
  "/refresh",
  validate(authValidators.refreshToken),
  authController.refreshToken,
);

// Protected routes
router.get("/me", authenticate, authController.me);
router.post("/logout", authenticate, authController.logout);

export default router;
