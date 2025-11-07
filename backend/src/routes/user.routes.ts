import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { userValidators } from "../utils/validators";

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.patch(
  "/profile",
  validate(userValidators.updateProfile),
  userController.updateProfile,
);
router.post(
  "/change-password",
  validate(userValidators.changePassword),
  userController.changePassword,
);
router.delete(
  "/account",
  validate(userValidators.deleteAccount),
  userController.deleteAccount,
);

// Settings routes
router.get("/settings", userController.getSettings);
router.patch("/settings", userController.updateSettings);

// Payment history
router.get("/payment-history", userController.getPaymentHistory);

export default router;
