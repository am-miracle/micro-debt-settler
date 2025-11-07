import { Router } from "express";
import authRoutes from "./auth.routes";
import oauthRoutes from "./oauth.routes";
import debtRoutes from "./debt.routes";
import friendRoutes from "./friend.routes";
import userRoutes from "./user.routes";
import paymentRoutes from "./payment.routes";
import { config } from "../config/env";

const router = Router();

// Health check
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// API routes
router.use("/auth", authRoutes);
router.use("/oauth", oauthRoutes);
router.use("/debts", debtRoutes);
router.use("/friends", friendRoutes);
router.use("/users", userRoutes);
router.use("/payment", paymentRoutes);

export default router;
