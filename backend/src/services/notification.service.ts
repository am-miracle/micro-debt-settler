import { Resend } from "resend";
import axios from "axios";
import { config } from "../config/env";
import { logger } from "../utils/logger";
import { Notification, User, Debt } from "../models";
import { formatCurrency } from "../utils/helpers";
import { getModelData } from "../utils/sequelize-helpers";

const resend = new Resend(config.email.resendApiKey);

/**
 * Base email sender using Resend
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
): Promise<void> => {
  try {
    await resend.emails.send({
      from: config.email.from,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to} via Resend`);
  } catch (error) {
    logger.error("Failed to send email via Resend:", error);
    throw error;
  }
};

/**
 * Send SMS notification via Twilio (international coverage)
 */
export const sendSMS = async (
  phone: string,
  message: string,
): Promise<void> => {
  try {
    if (!config.twilio.accountSid || !config.twilio.authToken) {
      logger.warn("Twilio not configured - skipping SMS notification");
      return;
    }

    const auth = Buffer.from(
      `${config.twilio.accountSid}:${config.twilio.authToken}`,
    ).toString("base64");

    await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
      new URLSearchParams({
        To: phone,
        From: config.twilio.phoneNumber,
        Body: message,
      }),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    logger.info(`SMS sent to ${phone} via Twilio`);
  } catch (error) {
    logger.error("Failed to send SMS via Twilio:", error);
    throw error;
  }
};

/**
 * Reusable email template builder
 */
const buildEmailTemplate = (params: {
  title: string;
  titleColor: string;
  greeting: string;
  message: string;
  details: { label: string; value: string }[];
  actionButton?: { text: string; url: string; color: string };
  footer?: string;
  paymentDetails?: string;
}): string => {
  const {
    title,
    titleColor,
    greeting,
    message,
    details,
    actionButton,
    footer,
    paymentDetails,
  } = params;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${titleColor};">${title}</h2>
      <p>${greeting}</p>
      <p>${message}</p>

      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        ${details.map((d) => `<p style="margin: 5px 0;"><strong>${d.label}:</strong> ${d.value}</p>`).join("")}
      </div>

      ${paymentDetails || ""}

      ${
        actionButton
          ? `<a href="${actionButton.url}"
             style="display: inline-block; padding: 12px 24px; background-color: ${actionButton.color}; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">
            ${actionButton.text}
          </a>`
          : ""
      }

      ${footer ? `<p style="color: #6b7280; margin-top: 20px;">${footer}</p>` : ""}

      <p style="margin-top: 30px;">Thank you!</p>
      <p style="color: #6b7280;"><em>${config.app.name}</em></p>
    </div>
  `;
};

/**
 * Get payment method details for display based on selected payment method
 */
const getPaymentMethodDetails = (
  debtData: any,
  paymentLink?: string,
): string => {
  const method = debtData.paymentMethod;

  // Bank Transfer
  if (
    method === "bank_transfer" &&
    debtData.bankName &&
    debtData.accountNumber
  ) {
    return `
      <h3 style="margin-top: 20px;">💳 Bank Transfer Details:</h3>
      <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 5px 0;"><strong>Bank:</strong> ${debtData.bankName}</p>
        <p style="margin: 5px 0;"><strong>Account Name:</strong> ${debtData.accountName || "N/A"}</p>
        <p style="margin: 5px 0;"><strong>Account Number:</strong> ${debtData.accountNumber}</p>
      </div>
      <p style="color: #6b7280; font-size: 14px;">Transfer ${formatCurrency(Number(debtData.amount), debtData.currency)} to the account above.</p>
    `;
  }

  // Paystack (Nigerian payment gateway)
  if (method === "paystack" && paymentLink) {
    return `
      <h3 style="margin-top: 20px;">💳 Pay with Paystack:</h3>
      <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 5px 0;">Click the button below to pay securely with Paystack (Card, Bank Transfer, USSD).</p>
        <a href="${paymentLink}?method=paystack"
           style="display: inline-block; padding: 12px 24px; background-color: #00c3f7; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">
          Pay with Paystack
        </a>
      </div>
    `;
  }

  // Flutterwave (African payment gateway)
  if (method === "flutterwave" && paymentLink) {
    return `
      <h3 style="margin-top: 20px;">💳 Pay with Flutterwave:</h3>
      <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 5px 0;">Click the button below to pay securely with Flutterwave (Card, Bank, Mobile Money).</p>
        <a href="${paymentLink}?method=flutterwave"
           style="display: inline-block; padding: 12px 24px; background-color: #f5a623; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">
          Pay with Flutterwave
        </a>
      </div>
    `;
  }

  // Stripe (International cards)
  if (method === "stripe" && paymentLink) {
    return `
      <h3 style="margin-top: 20px;">💳 Pay with Stripe:</h3>
      <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 5px 0;">Click the button below to pay securely with Stripe (International Cards).</p>
        <a href="${paymentLink}?method=stripe"
           style="display: inline-block; padding: 12px 24px; background-color: #635bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">
          Pay with Stripe
        </a>
      </div>
    `;
  }

  // PayPal
  if (method === "paypal" && paymentLink) {
    return `
      <h3 style="margin-top: 20px;">💳 Pay with PayPal:</h3>
      <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 5px 0;">Click the button below to pay securely with PayPal.</p>
        <a href="${paymentLink}?method=paypal"
           style="display: inline-block; padding: 12px 24px; background-color: #0070ba; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">
          Pay with PayPal
        </a>
      </div>
    `;
  }

  // Manual or no method specified - show all options
  if (!method || method === "manual") {
    let html = `<h3 style="margin-top: 20px;">Payment Options:</h3>`;

    // Show bank transfer if details available
    if (debtData.bankName && debtData.accountNumber) {
      html += `
        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>🏦 Bank Transfer:</strong></p>
          <p style="margin: 5px 0;">Bank: ${debtData.bankName}</p>
          <p style="margin: 5px 0;">Account: ${debtData.accountNumber}</p>
          <p style="margin: 5px 0;">Name: ${debtData.accountName || "N/A"}</p>
        </div>
      `;
    }

    // Show online payment link if available
    if (paymentLink) {
      html += `
        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>💳 Pay Online:</strong></p>
          <a href="${paymentLink}"
             style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">
            Choose Payment Method
          </a>
        </div>
      `;
    }

    return html;
  }

  return "";
};

/**
 * Send notification when a receivable debt is created (someone owes YOU)
 * Notifies the DEBTOR
 */
export const sendDebtCreatedNotification = async (
  debtId: string,
): Promise<void> => {
  try {
    const debt = await Debt.findByPk(debtId, {
      include: [
        {
          model: User,
          as: "debtor",
          attributes: ["id", "email", "name", "phone"],
        },
        {
          model: User,
          as: "creditor",
          attributes: ["id", "email", "name", "phone"],
        },
      ],
    });

    if (!debt) throw new Error("Debt not found");

    const debtData = getModelData(debt);
    const amountFormatted = formatCurrency(
      Number(debtData.amount),
      debtData.currency,
    );

    // Get debtor info
    let debtorEmail: string | null = null;
    let debtorName: string | null = null;
    let debtorPhone: string | null = null;

    if (debtData.debtorId && debt.get("debtor")) {
      const debtor = getModelData(debt.get("debtor"));
      debtorEmail = debtor.email;
      debtorName = debtor.name;
      debtorPhone = debtor.phone;
    } else {
      debtorName = debtData.debtorName;
      debtorEmail = debtData.debtorEmail;
      debtorPhone = debtData.debtorPhone;
    }

    // Get creditor info
    let creditorName: string | null = null;
    if (debtData.creditorId && debt.get("creditor")) {
      creditorName = getModelData(debt.get("creditor")).name;
    } else {
      creditorName = debtData.creditorName;
    }

    const paymentLink = `${config.app.frontendUrls[0]}/payment/${debtData.id}`;

    // Send Email
    if (debtorEmail) {
      const details = [
        { label: "Amount", value: amountFormatted },
        { label: "Description", value: debtData.description },
        {
          label: "Due Date",
          value: new Date(debtData.dueDate).toLocaleDateString(),
        },
      ];

      const emailHtml = buildEmailTemplate({
        title: "💰 New Debt Notification",
        titleColor: "#2563eb",
        greeting: `Hi ${debtorName || "there"},`,
        message: `${creditorName || "Someone"} has recorded that you owe <strong>${amountFormatted}</strong>.`,
        details,
        paymentDetails: getPaymentMethodDetails(debtData, paymentLink),
        actionButton: debtData.debtorId
          ? { text: "View & Pay Now", url: paymentLink, color: "#2563eb" }
          : undefined,
        footer: debtData.debtorId
          ? undefined
          : `Please contact ${creditorName} to settle this payment.`,
      });

      await sendEmail(
        debtorEmail,
        `New Debt: ${amountFormatted} owed to ${creditorName}`,
        emailHtml,
      );
    }

    // Send SMS to ALL users
    if (debtorPhone) {
      let smsMessage = `${config.app.name}: ${creditorName || "Someone"} says you owe ${amountFormatted} for "${debtData.description}". Due: ${new Date(debtData.dueDate).toLocaleDateString()}.`;

      if (debtData.bankName && debtData.accountNumber) {
        smsMessage += ` Pay to: ${debtData.bankName} - ${debtData.accountNumber}`;
      }

      await sendSMS(debtorPhone, smsMessage);
    }

    // Log notification for ALL users (registered and non-registered)
    await Notification.create({
      userId: debtData.debtorId || null,
      recipientEmail: debtorEmail || null,
      recipientPhone: debtorPhone || null,
      recipientName: debtorName || null,
      debtId: debtData.id,
      type: "debt_created",
      channel: debtorEmail ? "email" : "sms",
      body: debtorEmail
        ? `New debt notification sent`
        : `SMS notification sent`,
      status: "sent",
      sentAt: new Date(),
    });

    logger.info(`Debt created notification sent for debt ${debtId}`);
  } catch (error) {
    logger.error("Failed to send debt created notification:", error);
  }
};

/**
 * Send notification when YOU create a debt YOU owe
 * Notifies the CREDITOR
 */
export const sendCreditorDebtNotification = async (
  debtId: string,
): Promise<void> => {
  try {
    const debt = await Debt.findByPk(debtId, {
      include: [
        { model: User, as: "debtor", attributes: ["id", "email", "name"] },
        {
          model: User,
          as: "creditor",
          attributes: ["id", "email", "name", "phone"],
        },
      ],
    });

    if (!debt) throw new Error("Debt not found");

    const debtData = getModelData(debt);
    const amountFormatted = formatCurrency(
      Number(debtData.amount),
      debtData.currency,
    );

    // Get creditor info
    let creditorEmail: string | null = null;
    let creditorName: string | null = null;
    let creditorPhone: string | null = null;

    if (debtData.creditorId && debt.get("creditor")) {
      const creditor = getModelData(debt.get("creditor"));
      creditorEmail = creditor.email;
      creditorName = creditor.name;
      creditorPhone = creditor.phone;
    } else {
      creditorName = debtData.creditorName;
      creditorEmail = debtData.creditorEmail;
      creditorPhone = debtData.creditorPhone;
    }

    // Get debtor info
    let debtorName: string | null = null;
    if (debtData.debtorId && debt.get("debtor")) {
      debtorName = getModelData(debt.get("debtor")).name;
    } else {
      debtorName = debtData.debtorName;
    }

    // Send Email
    if (creditorEmail) {
      const details = [
        { label: "Amount", value: amountFormatted },
        { label: "Description", value: debtData.description },
        {
          label: "Due Date",
          value: new Date(debtData.dueDate).toLocaleDateString(),
        },
      ];

      const emailHtml = buildEmailTemplate({
        title: "✅ Debt Acknowledged",
        titleColor: "#10b981",
        greeting: `Hi ${creditorName || "there"},`,
        message: `${debtorName || "Someone"} has acknowledged that they owe you <strong>${amountFormatted}</strong>.`,
        details,
        paymentDetails: getPaymentMethodDetails(debtData),
        footer: `You'll receive a notification when ${debtorName} makes the payment.`,
      });

      await sendEmail(
        creditorEmail,
        `${debtorName} acknowledged debt: ${amountFormatted}`,
        emailHtml,
      );
    }

    // Send SMS to ALL users
    if (creditorPhone) {
      let smsMessage = `${config.app.name}: ${debtorName || "Someone"} acknowledged they owe you ${amountFormatted} for "${debtData.description}". Due: ${new Date(debtData.dueDate).toLocaleDateString()}.`;

      if (debtData.bankName && debtData.accountNumber) {
        smsMessage += ` They will pay to: ${debtData.bankName} - ${debtData.accountNumber}`;
      }

      await sendSMS(creditorPhone, smsMessage);
    }

    // Log notification for ALL users (registered and non-registered)
    await Notification.create({
      userId: debtData.creditorId || null,
      recipientEmail: creditorEmail || null,
      recipientPhone: creditorPhone || null,
      recipientName: creditorName || null,
      debtId: debtData.id,
      type: "debt_acknowledged",
      channel: creditorEmail ? "email" : "sms",
      body: creditorEmail
        ? `Debt acknowledged notification sent`
        : `SMS notification sent`,
      status: "sent",
      sentAt: new Date(),
    });

    logger.info(`Creditor debt notification sent for debt ${debtId}`);
  } catch (error) {
    logger.error("Failed to send creditor debt notification:", error);
  }
};

/**
 * Send payment request (manual trigger)
 */
export const sendPaymentRequest = async (debtId: string): Promise<void> => {
  try {
    const debt = await Debt.findByPk(debtId, {
      include: [
        {
          model: User,
          as: "debtor",
          attributes: ["id", "email", "name", "phone"],
        },
        { model: User, as: "creditor", attributes: ["id", "email", "name"] },
      ],
    });

    if (!debt) throw new Error("Debt not found");

    const debtData = getModelData(debt);

    // Get debtor info (registered or non-registered)
    let debtorEmail: string | null = null;
    let debtorName: string | null = null;
    let debtorPhone: string | null = null;

    if (debtData.debtorId && debt.get("debtor")) {
      const debtor = getModelData(debt.get("debtor"));
      debtorEmail = debtor.email;
      debtorName = debtor.name;
      debtorPhone = debtor.phone;
    } else {
      debtorName = debtData.debtorName;
      debtorEmail = debtData.debtorEmail;
      debtorPhone = debtData.debtorPhone;
    }

    // Get creditor info
    let creditorName: string | null = null;
    if (debtData.creditorId && debt.get("creditor")) {
      creditorName = getModelData(debt.get("creditor")).name;
    } else {
      creditorName = debtData.creditorName;
    }

    const amountFormatted = formatCurrency(
      Number(debtData.amount),
      debtData.currency,
    );
    const paymentLink = `${config.app.frontendUrls[0]}/payment/${debtData.id}`;

    const details = [
      { label: "Amount", value: amountFormatted },
      { label: "Description", value: debtData.description },
      { label: "Reference", value: `#${debtData.id.slice(0, 8)}` },
    ];

    const emailHtml = buildEmailTemplate({
      title: "💰 Payment Request",
      titleColor: "#2563eb",
      greeting: `Hi ${debtorName},`,
      message: `This is a friendly reminder that you owe <strong>${amountFormatted}</strong> to ${creditorName}.`,
      details,
      paymentDetails: getPaymentMethodDetails(debtData, paymentLink),
      actionButton: debtData.debtorId
        ? { text: "Pay Now", url: paymentLink, color: "#2563eb" }
        : undefined,
    });

    if (debtorEmail) {
      await sendEmail(
        debtorEmail,
        `Payment Request: ${amountFormatted}`,
        emailHtml,
      );
    }

    // Log notification for ALL users
    await Notification.create({
      userId: debtData.debtorId || null,
      recipientEmail: debtorEmail || null,
      recipientPhone: debtorPhone || null,
      recipientName: debtorName || null,
      debtId: debtData.id,
      type: "payment_request",
      channel: "email",
      body: `Payment request sent`,
      status: "sent",
      sentAt: new Date(),
    });

    logger.info(`Payment request sent for debt ${debtId}`);
  } catch (error) {
    logger.error("Failed to send payment request:", error);
    throw error;
  }
};

/**
 * Send payment reminder
 */
export const sendPaymentReminder = async (debtId: string): Promise<void> => {
  try {
    const debt = await Debt.findByPk(debtId, {
      include: [
        {
          model: User,
          as: "debtor",
          attributes: ["id", "email", "name", "phone"],
        },
        { model: User, as: "creditor", attributes: ["id", "email", "name"] },
      ],
    });

    if (!debt) throw new Error("Debt not found");

    const debtData = getModelData(debt);

    // Get debtor info (registered or non-registered)
    let debtorEmail: string | null = null;
    let debtorName: string | null = null;
    let debtorPhone: string | null = null;

    if (debtData.debtorId && debt.get("debtor")) {
      const debtor = getModelData(debt.get("debtor"));
      debtorEmail = debtor.email;
      debtorName = debtor.name;
      debtorPhone = debtor.phone;
    } else {
      debtorName = debtData.debtorName;
      debtorEmail = debtData.debtorEmail;
      debtorPhone = debtData.debtorPhone;
    }

    // Get creditor info
    let creditorName: string | null = null;
    if (debtData.creditorId && debt.get("creditor")) {
      creditorName = getModelData(debt.get("creditor")).name;
    } else {
      creditorName = debtData.creditorName;
    }

    const amountFormatted = formatCurrency(
      Number(debtData.amount),
      debtData.currency,
    );
    const paymentLink = `${config.app.frontendUrls[0]}/payment/${debtData.id}`;

    const details = [
      { label: "Amount", value: amountFormatted },
      { label: "Description", value: debtData.description },
    ];

    const emailHtml = buildEmailTemplate({
      title: "⏰ Payment Reminder",
      titleColor: "#f59e0b",
      greeting: `Hi ${debtorName},`,
      message: `This is a gentle reminder about your pending payment of <strong>${amountFormatted}</strong> to ${creditorName}.`,
      details,
      paymentDetails: getPaymentMethodDetails(debtData, paymentLink),
      actionButton: debtData.debtorId
        ? { text: "Pay Now", url: paymentLink, color: "#f59e0b" }
        : undefined,
      footer: "Please settle this payment at your earliest convenience.",
    });

    if (debtorEmail) {
      await sendEmail(
        debtorEmail,
        `Reminder: Payment of ${amountFormatted}`,
        emailHtml,
      );
    }

    // Log notification for ALL users
    await Notification.create({
      userId: debtData.debtorId || null,
      recipientEmail: debtorEmail || null,
      recipientPhone: debtorPhone || null,
      recipientName: debtorName || null,
      debtId: debtData.id,
      type: "payment_reminder",
      channel: "email",
      body: `Payment reminder sent`,
      status: "sent",
      sentAt: new Date(),
    });

    logger.info(`Payment reminder sent for debt ${debtId}`);
  } catch (error) {
    logger.error("Failed to send payment reminder:", error);
    throw error;
  }
};

/**
 * Send payment confirmation
 */
export const sendPaymentConfirmation = async (
  debtId: string,
): Promise<void> => {
  try {
    const debt = await Debt.findByPk(debtId, {
      include: [
        {
          model: User,
          as: "debtor",
          attributes: ["id", "email", "name", "phone"],
        },
        {
          model: User,
          as: "creditor",
          attributes: ["id", "email", "name", "phone"],
        },
      ],
    });

    if (!debt) throw new Error("Debt not found");

    const debtData = getModelData(debt);

    // Get debtor info (registered or non-registered)
    let debtorEmail: string | null = null;
    let debtorName: string | null = null;
    let debtorPhone: string | null = null;

    if (debtData.debtorId && debt.get("debtor")) {
      const debtor = getModelData(debt.get("debtor"));
      debtorEmail = debtor.email;
      debtorName = debtor.name;
      debtorPhone = debtor.phone;
    } else {
      debtorName = debtData.debtorName;
      debtorEmail = debtData.debtorEmail;
      debtorPhone = debtData.debtorPhone;
    }

    // Get creditor info (registered or non-registered)
    let creditorEmail: string | null = null;
    let creditorName: string | null = null;
    let creditorPhone: string | null = null;

    if (debtData.creditorId && debt.get("creditor")) {
      const creditor = getModelData(debt.get("creditor"));
      creditorEmail = creditor.email;
      creditorName = creditor.name;
      creditorPhone = creditor.phone;
    } else {
      creditorName = debtData.creditorName;
      creditorEmail = debtData.creditorEmail;
      creditorPhone = debtData.creditorPhone;
    }

    const amountFormatted = formatCurrency(
      Number(debtData.amount),
      debtData.currency,
    );

    const details = [
      { label: "Amount Paid", value: amountFormatted },
      { label: "Description", value: debtData.description },
      { label: "Status", value: "✓ Settled" },
    ];

    // Email to debtor
    const debtorEmailHtml = buildEmailTemplate({
      title: "✅ Payment Confirmed",
      titleColor: "#10b981",
      greeting: `Hi ${debtorName},`,
      message: `Your payment of <strong>${amountFormatted}</strong> to ${creditorName} has been received successfully!`,
      details,
      footer: "Thank you for settling your debt promptly!",
    });

    // Email to creditor
    const creditorDetails = [
      { label: "Amount Received", value: amountFormatted },
      { label: "From", value: debtorName },
      { label: "Description", value: debtData.description },
    ];

    const creditorEmailHtml = buildEmailTemplate({
      title: "💰 Payment Received",
      titleColor: "#10b981",
      greeting: `Hi ${creditorName},`,
      message: `Good news! ${debtorName} has paid you <strong>${amountFormatted}</strong>.`,
      details: creditorDetails,
      footer: "The debt has been marked as settled.",
    });

    const emailPromises = [];
    if (debtorEmail) {
      emailPromises.push(
        sendEmail(
          debtorEmail,
          `Payment Confirmed: ${amountFormatted}`,
          debtorEmailHtml,
        ),
      );
    }
    if (creditorEmail) {
      emailPromises.push(
        sendEmail(
          creditorEmail,
          `Payment Received: ${amountFormatted}`,
          creditorEmailHtml,
        ),
      );
    }

    await Promise.all(emailPromises);

    // Log notifications for ALL users (registered and non-registered)
    await Promise.all([
      Notification.create({
        userId: debtData.debtorId || null,
        recipientEmail: debtorEmail || null,
        recipientPhone: debtorPhone || null,
        recipientName: debtorName || null,
        debtId: debtData.id,
        type: "debt_settled",
        channel: "email",
        body: `Payment confirmed notification sent`,
        status: "sent",
        sentAt: new Date(),
      }),
      Notification.create({
        userId: debtData.creditorId || null,
        recipientEmail: creditorEmail || null,
        recipientPhone: creditorPhone || null,
        recipientName: creditorName || null,
        debtId: debtData.id,
        type: "payment_received",
        channel: "email",
        body: `Payment received notification sent`,
        status: "sent",
        sentAt: new Date(),
      }),
    ]);

    logger.info(`Payment confirmation sent for debt ${debtId}`);
  } catch (error) {
    logger.error("Failed to send payment confirmation:", error);
    throw error;
  }
};
