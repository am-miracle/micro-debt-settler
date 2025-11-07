import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { paymentValidators } from "../utils/validators";
import { paymentRateLimit } from "../middleware/rateLimit.middleware";
import express from "express";

const router = Router();

// Webhook routes (no authentication, raw body needed for signature verification)
router.post(
  "/webhook/stripe",
  express.raw({ type: "application/json" }),
  paymentController.handleStripeWebhook,
);

router.post(
  "/webhook/paystack",
  express.json(),
  paymentController.handlePaystackWebhook,
);

// Protected payment routes
router.use(authenticate);

// Nigerian Payment Methods
router.post(
  "/bank-transfer/:debtId",
  paymentRateLimit,
  validate(paymentValidators.initiatePayment),
  paymentController.initiateBankTransfer,
);

router.post(
  "/paystack/:debtId",
  paymentRateLimit,
  validate(paymentValidators.initiatePayment),
  paymentController.initiatePaystackPayment,
);

router.post(
  "/flutterwave/:debtId",
  paymentRateLimit,
  validate(paymentValidators.initiatePayment),
  paymentController.initiateFlutterwavePayment,
);

// International Payment Methods
router.post(
  "/stripe/:debtId",
  paymentRateLimit,
  validate(paymentValidators.initiatePayment),
  paymentController.initiateStripePayment,
);

router.post(
  "/paypal/:debtId",
  paymentRateLimit,
  validate(paymentValidators.initiatePayment),
  paymentController.initiatePayPalPayment,
);

router.post(
  "/paypal/capture/:orderId",
  paymentRateLimit,
  paymentController.capturePayPalPayment,
);

export default router;
