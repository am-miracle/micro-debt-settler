import Stripe from "stripe";
import axios from "axios";
import {
  Client,
  OrdersController,
  OrderRequest,
  CheckoutPaymentIntent,
  Environment,
} from "@paypal/paypal-server-sdk";
import { config } from "../config/env";
import { Debt, Transaction, User } from "../models";
import { AppError } from "../middleware/error.middleware";
import { logger } from "../utils/logger";
import { sendPaymentConfirmation } from "./notification.service";
import {
  PaymentResult,
  BankTransferDetails,
  UserPaymentPreference,
} from "../types/payment.types";
import { getModelData } from "../utils/sequelize-helpers";

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2025-02-24.acacia",
});

/**
 * PayPal client setup
 */
const getPayPalClient = () => {
  return new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: config.paypal.clientId,
      oAuthClientSecret: config.paypal.clientSecret,
    },
    environment:
      config.paypal.mode === "production"
        ? Environment.Production
        : Environment.Sandbox,
  });
};

/**
 * Generate unique payment reference
 */
const generatePaymentReference = (debtId: string): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${config.payment.bankTransferReferencePrefix}-${debtId.slice(0, 8)}-${timestamp}-${random}`;
};

/**
 * Get creditor's payment preferences
 */
const getCreditorPaymentPreferences = async (
  creditorId: string,
): Promise<UserPaymentPreference | null> => {
  const user = await User.findByPk(creditorId);
  if (!user) return null;

  const userData = getModelData(user);

  // This would come from a user preferences table in a real app
  // For now, we'll return a default structure
  return {
    provider: "bank_transfer",
    // These would be stored in user profile
    accountNumber: userData.accountNumber as string,
    bankName: userData.bankName as string,
    accountName: userData.name,
  };
};

/**
 * Generate deep link for payment app
 * @unused Reserved for future mobile integration
 */
// @ts-expect-error- Reserved for future mobile integration
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generateDeepLink = (
  provider: string,
  handle: string,
  amount: number,
  note: string,
): string => {
  const encodedNote = encodeURIComponent(note);

  switch (provider.toLowerCase()) {
    case "opay":
      return `opay://transfer?account=${handle}&amount=${amount}&note=${encodedNote}`;
    case "kuda":
      return `kuda://send?account=${handle}&amount=${amount}&note=${encodedNote}`;
    case "palmpay":
      return `palmpay://pay?account=${handle}&amount=${amount}&note=${encodedNote}`;
    case "cashapp":
      return `https://cash.app/$${handle}/${amount}`;
    case "venmo":
      return `venmo://paycharge?txn=pay&recipients=${handle}&amount=${amount}&note=${encodedNote}`;
    default:
      return `${config.app.frontendUrls[0]}/pay?provider=${provider}&handle=${handle}&amount=${amount}`;
  }
};

/**
 * Create bank transfer payment (Nigerian banks)
 */
export const createBankTransferPayment = async (
  debtId: string,
): Promise<PaymentResult> => {
  try {
    const debt = await Debt.findByPk(debtId, {
      include: [
        { model: User, as: "creditor", attributes: ["id", "email", "name"] },
        { model: User, as: "debtor", attributes: ["id", "email", "name"] },
      ],
    });

    if (!debt) {
      throw new AppError("Debt not found", 404);
    }

    const debtData = getModelData(debt);

    if (debtData.status === "settled" || debtData.status === "cancelled") {
      throw new AppError("Debt is already settled or cancelled", 400);
    }

    // Get creditor's bank details
    const creditor = getModelData(debt.get("creditor"));
    const preferences = await getCreditorPaymentPreferences(
      debtData.creditorId,
    );

    if (!preferences || !preferences.accountNumber) {
      throw new AppError("Creditor has not set up bank account details", 400);
    }

    const reference = generatePaymentReference(debtData.id);

    const bankDetails: BankTransferDetails = {
      bankName: preferences.bankName || "Bank",
      accountNumber: preferences.accountNumber,
      accountName: creditor.name,
      amount: Number(debtData.amount),
      currency: debtData.currency || "NGN",
      reference,
    };

    // Create transaction record
    await Transaction.create({
      debtId: debtData.id,
      paymentMethod: "manual",
      paymentId: reference,
      status: "pending",
      amount: debtData.amount,
      currency: debtData.currency,
    });

    // Update debt status
    await debt.update({ status: "payment_requested" });

    return {
      success: true,
      paymentMethod: "bank_transfer",
      paymentId: reference,
      bankDetails,
      message:
        "Bank transfer details generated. Please complete the transfer manually.",
    };
  } catch (error) {
    logger.error("Bank transfer payment creation failed:", error);
    throw error instanceof AppError
      ? error
      : new AppError("Payment initiation failed", 500);
  }
};

/**
 * Create Paystack payment (Nigeria)
 */
export const createPaystackPayment = async (
  debtId: string,
): Promise<PaymentResult> => {
  try {
    const debt = await Debt.findByPk(debtId, {
      include: [
        { model: User, as: "debtor", attributes: ["id", "email", "name"] },
        { model: User, as: "creditor", attributes: ["id", "email", "name"] },
      ],
    });

    if (!debt) {
      throw new AppError("Debt not found", 404);
    }

    const debtData = getModelData(debt);

    if (debtData.status === "settled" || debtData.status === "cancelled") {
      throw new AppError("Debt is already settled or cancelled", 400);
    }

    const debtor = getModelData(debt.get("debtor"));
    const reference = generatePaymentReference(debtData.id);

    // Initialize Paystack transaction
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: debtor.email,
        amount: Math.round(Number(debtData.amount) * 100), // Kobo for NGN
        reference,
        currency: debtData.currency,
        metadata: {
          debtId: debtData.id,
          debtorId: debtData.debtorId,
          creditorId: debtData.creditorId,
          description: debtData.description,
        },
        callback_url: `${config.app.frontendUrls[0]}/payment/callback`,
      },
      {
        headers: {
          Authorization: `Bearer ${config.paystack.secretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const { authorization_url } = response.data.data;

    // Create transaction record
    await Transaction.create({
      debtId: debtData.id,
      paymentMethod: "paystack",
      paymentId: reference,
      status: "pending",
      amount: debtData.amount,
      currency: debtData.currency,
    });

    // Update debt status
    await debt.update({ status: "payment_requested" });

    return {
      success: true,
      paymentMethod: "paystack" as any,
      paymentId: reference,
      paymentUrl: authorization_url,
      message: "Paystack payment initialized successfully",
    };
  } catch (error: any) {
    logger.error(
      "Paystack payment creation failed:",
      error?.response?.data || error,
    );
    throw new AppError("Payment initiation failed", 500);
  }
};

/**
 * Create Flutterwave payment (Nigeria & Africa)
 */
export const createFlutterwavePayment = async (
  debtId: string,
): Promise<PaymentResult> => {
  try {
    const debt = await Debt.findByPk(debtId, {
      include: [
        { model: User, as: "debtor", attributes: ["id", "email", "name"] },
        { model: User, as: "creditor", attributes: ["id", "email", "name"] },
      ],
    });

    if (!debt) {
      throw new AppError("Debt not found", 404);
    }

    const debtData = getModelData(debt);

    if (debtData.status === "settled" || debtData.status === "cancelled") {
      throw new AppError("Debt is already settled or cancelled", 400);
    }

    const debtor = getModelData(debt.get("debtor"));
    const reference = generatePaymentReference(debtData.id);

    // Initialize Flutterwave transaction
    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref: reference,
        amount: Number(debtData.amount),
        currency: debtData.currency,
        redirect_url: `${config.app.frontendUrls[0]}/payment/callback`,
        customer: {
          email: debtor.email,
          name: debtor.name,
        },
        customizations: {
          title: config.app.name,
          description: debtData.description,
        },
        meta: {
          debtId: debtData.id,
          debtorId: debtData.debtorId,
          creditorId: debtData.creditorId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${config.flutterwave.secretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const paymentUrl = response.data.data.link;

    // Create transaction record
    await Transaction.create({
      debtId: debtData.id,
      paymentMethod: "flutterwave",
      paymentId: reference,
      status: "pending",
      amount: debtData.amount,
      currency: debtData.currency,
    });

    // Update debt status
    await debt.update({ status: "payment_requested" });

    return {
      success: true,
      paymentMethod: "flutterwave" as any,
      paymentId: reference,
      paymentUrl,
      message: "Flutterwave payment initialized successfully",
    };
  } catch (error: any) {
    logger.error(
      "Flutterwave payment creation failed:",
      error?.response?.data || error,
    );
    throw new AppError("Payment initiation failed", 500);
  }
};

/**
 * Create PayPal payment (International)
 */
export const createPayPalPayment = async (
  debtId: string,
): Promise<PaymentResult> => {
  try {
    const debt = await Debt.findByPk(debtId, {
      include: [
        { model: User, as: "debtor", attributes: ["id", "email", "name"] },
        { model: User, as: "creditor", attributes: ["id", "email", "name"] },
      ],
    });

    if (!debt) {
      throw new AppError("Debt not found", 404);
    }

    const debtData = getModelData(debt);

    if (debtData.status === "settled" || debtData.status === "cancelled") {
      throw new AppError("Debt is already settled or cancelled", 400);
    }

    const creditor = getModelData(debt.get("creditor"));
    const reference = generatePaymentReference(debtData.id);

    // Create PayPal order
    const client = getPayPalClient();
    const ordersController = new OrdersController(client);

    const orderRequest: OrderRequest = {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          referenceId: reference,
          description: debtData.description || "Debt settlement",
          customId: debtData.id,
          amount: {
            currencyCode: debtData.currency,
            value: Number(debtData.amount).toFixed(2),
          },
          payee: {
            emailAddress: creditor.email,
          },
        },
      ],
      applicationContext: {
        brandName: config.app.name,
        returnUrl: `${config.app.frontendUrls[0]}/payment/paypal/success`,
        cancelUrl: `${config.app.frontendUrls[0]}/payment/paypal/cancel`,
      },
    };

    const { result: order } = await ordersController.createOrder({
      body: orderRequest,
      prefer: "return=representation",
    });

    // Get approval URL
    const approvalUrl = order?.links?.find(
      (link: any) => link.rel === "approve",
    )?.href;

    if (!approvalUrl) {
      throw new AppError("PayPal approval URL not found", 500);
    }

    // Create transaction record
    await Transaction.create({
      debtId: debtData.id,
      paymentMethod: "paypal",
      paymentId: order.id || "",
      status: "pending",
      amount: debtData.amount,
      currency: debtData.currency,
    });

    // Update debt status
    await debt.update({ status: "payment_requested" });

    return {
      success: true,
      paymentMethod: "paypal",
      paymentId: order.id || "",
      paymentUrl: approvalUrl,
      message: "PayPal payment initialized successfully",
    };
  } catch (error: any) {
    logger.error(
      "PayPal payment creation failed:",
      error?.response?.data || error,
    );
    throw new AppError("Payment initiation failed", 500);
  }
};

/**
 * Capture PayPal payment after user approval
 */
export const capturePayPalPayment = async (
  orderId: string,
): Promise<{ success: boolean; debtId?: string }> => {
  try {
    const client = getPayPalClient();
    const ordersController = new OrdersController(client);

    const { result: order } = await ordersController.captureOrder({
      id: orderId,
      prefer: "return=representation",
    });

    if (order.status === "COMPLETED") {
      const debtId = order.purchaseUnits?.[0]?.customId;

      if (!debtId) {
        throw new AppError("Debt ID not found in PayPal order", 400);
      }

      // Update transaction
      await Transaction.update(
        { status: "completed" },
        { where: { paymentId: orderId } },
      );

      // Update debt
      const debt = await Debt.findByPk(debtId);
      if (debt) {
        await debt.update({ status: "settled" });
        await sendPaymentConfirmation(debtId);
      }

      logger.info(`PayPal payment captured for debt ${debtId}`);

      return { success: true, debtId };
    }

    throw new AppError("PayPal payment capture failed", 400);
  } catch (error: any) {
    logger.error("PayPal capture failed:", error);
    throw new AppError("Payment capture failed", 500);
  }
};

/**
 * Create Stripe payment (International fallback)
 */
export const createStripePaymentIntent = async (
  debtId: string,
): Promise<PaymentResult> => {
  try {
    const debt = await Debt.findByPk(debtId);

    if (!debt) {
      throw new AppError("Debt not found", 404);
    }

    const debtData = getModelData(debt);

    if (debtData.status === "settled" || debtData.status === "cancelled") {
      throw new AppError("Debt is already settled or cancelled", 400);
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(debtData.amount) * 100),
      currency: debtData.currency.toLowerCase(),
      metadata: {
        debtId: debtData.id,
        debtorId: debtData.debtorId,
        creditorId: debtData.creditorId,
      },
      description: debtData.description,
    });

    // Create transaction record
    await Transaction.create({
      debtId: debtData.id,
      paymentMethod: "stripe",
      paymentId: paymentIntent.id,
      status: "pending",
      amount: debtData.amount,
      currency: debtData.currency,
    });

    // Update debt status
    await debt.update({ status: "payment_requested" });

    return {
      success: true,
      paymentMethod: "stripe",
      paymentId: paymentIntent.id,
      paymentUrl: `${config.app.frontendUrls[0]}/payment/${debtData.id}?client_secret=${paymentIntent.client_secret}`,
    };
  } catch (error) {
    logger.error("Stripe payment intent creation failed:", error);
    throw new AppError("Payment initiation failed", 500);
  }
};

/**
 * Handle Stripe webhook
 */
export const handleStripeWebhook = async (event: any): Promise<void> => {
  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const debtId = paymentIntent.metadata.debtId;

        await Transaction.update(
          { status: "completed" },
          { where: { paymentId: paymentIntent.id } },
        );

        const debt = await Debt.findByPk(debtId);
        if (debt) {
          await debt.update({ status: "settled" });
          await sendPaymentConfirmation(debtId);
        }

        logger.info(`Payment succeeded for debt ${debtId}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        await Transaction.update(
          { status: "failed" },
          { where: { paymentId: paymentIntent.id } },
        );

        logger.error(`Payment failed for payment intent ${paymentIntent.id}`);
        break;
      }

      default:
        logger.info(`Unhandled webhook event type: ${event.type}`);
    }
  } catch (error) {
    logger.error("Webhook handling failed:", error);
    throw error;
  }
};

/**
 * Handle Paystack webhook
 */
export const handlePaystackWebhook = async (event: any): Promise<void> => {
  try {
    if (event.event === "charge.success") {
      const reference = event.data.reference;
      const debtId = event.data.metadata.debtId;

      await Transaction.update(
        { status: "completed" },
        { where: { paymentId: reference } },
      );

      const debt = await Debt.findByPk(debtId);
      if (debt) {
        await debt.update({ status: "settled" });
        await sendPaymentConfirmation(debtId);
      }

      logger.info(`Paystack payment succeeded for debt ${debtId}`);
    }
  } catch (error) {
    logger.error("Paystack webhook handling failed:", error);
    throw error;
  }
};

/**
 * Record manual payment confirmation
 */
export const recordManualPayment = async (
  debtId: string,
  userId: string,
): Promise<void> => {
  const debt = await Debt.findByPk(debtId);

  if (!debt) {
    throw new AppError("Debt not found", 404);
  }

  const debtData = getModelData(debt);

  // Only debtor or creditor can record manual payment
  if (debtData.debtorId !== userId && debtData.creditorId !== userId) {
    throw new AppError("Not authorized", 403);
  }

  if (debtData.status === "settled") {
    throw new AppError("Debt is already settled", 400);
  }

  // Create transaction
  await Transaction.create({
    debtId: debtData.id,
    paymentMethod: "manual",
    status: "completed",
    amount: debtData.amount,
    currency: debtData.currency,
  });

  // Update debt
  await debt.update({ status: "settled" });

  // Send confirmation
  await sendPaymentConfirmation(debtId);

  logger.info(`Manual payment recorded for debt ${debtId}`);
};
