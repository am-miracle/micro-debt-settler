import { Request, Response, NextFunction } from "express";
import * as paymentService from "../services/payment.service";
import { ApiResponse } from "../utils/helpers";
import { CONSTANTS } from "../utils/constants";
import { config } from "../config/env";
import Stripe from "stripe";
import crypto from "crypto";

// bank transfer payment (Nigerian banks)
// returns bank account details for manual transfer
export const initiateBankTransfer = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { debtId } = req.params;

    const result = await paymentService.createBankTransferPayment(debtId);

    ApiResponse.success(
      res,
      result,
      "Bank transfer details generated successfully",
    );
  } catch (error) {
    next(error);
  }
};

// Paystack payment (Nigeria)
export const initiatePaystackPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { debtId } = req.params;

    const result = await paymentService.createPaystackPayment(debtId);

    ApiResponse.success(res, result, CONSTANTS.SUCCESS.PAYMENT_INITIATED);
  } catch (error) {
    next(error);
  }
};

// Flutterwave payment (Nigeria and Africa)
export const initiateFlutterwavePayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { debtId } = req.params;

    const result = await paymentService.createFlutterwavePayment(debtId);

    ApiResponse.success(res, result, CONSTANTS.SUCCESS.PAYMENT_INITIATED);
  } catch (error) {
    next(error);
  }
};

// Stripe payment (International)
export const initiateStripePayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { debtId } = req.params;

    const result = await paymentService.createStripePaymentIntent(debtId);

    ApiResponse.success(res, result, CONSTANTS.SUCCESS.PAYMENT_INITIATED);
  } catch (error) {
    next(error);
  }
};

// PayPal payment (International)
export const initiatePayPalPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { debtId } = req.params;

    const result = await paymentService.createPayPalPayment(debtId);

    ApiResponse.success(res, result, CONSTANTS.SUCCESS.PAYMENT_INITIATED);
  } catch (error) {
    next(error);
  }
};

// Capture PayPal payment after approval
export const capturePayPalPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { orderId } = req.params;

    const result = await paymentService.capturePayPalPayment(orderId);

    ApiResponse.success(res, result, CONSTANTS.SUCCESS.PAYMENT_COMPLETED);
  } catch (error) {
    next(error);
  }
};

// record manual payment confirmation
// used when payment is done outside the app
export const recordManualPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { debtId } = req.params;
    const userId = req.userId!;

    await paymentService.recordManualPayment(debtId, userId);

    ApiResponse.success(res, null, CONSTANTS.SUCCESS.PAYMENT_COMPLETED);
  } catch (error) {
    next(error);
  }
};

// handle Stripe webhook
export const handleStripeWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const sig = req.headers["stripe-signature"] as string;
    const stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: "2025-02-24.acacia",
    });

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.stripe.webhookSecret,
      );
    } catch (err: any) {
      ApiResponse.error(
        res,
        `Webhook signature verification failed: ${err.message}`,
        400,
      );
      return;
    }

    await paymentService.handleStripeWebhook(event);

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

// handle Paystack webhook
export const handlePaystackWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const hash = req.headers["x-paystack-signature"] as string;
    const secret = config.paystack.secretKey;

    // verify Paystack signature
    const expectedHash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== expectedHash) {
      ApiResponse.error(res, "Invalid webhook signature", 400);
      return;
    }

    await paymentService.handlePaystackWebhook(req.body);

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};
