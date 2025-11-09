import cron from "node-cron";
import { Debt, User, Notification } from "../models";
import { sendPaymentReminder } from "../services/notification.service";
import { logger } from "../utils/logger";
import { CONSTANTS } from "../utils/constants";
import { getModelData } from "../utils/sequelize-helpers";

let isRunning = false;

// this determine if a reminder should be sent based on nag sensitivity
const shouldSendReminder = (
  nagSensitivity: "low" | "medium" | "high",
  lastReminderDate: Date | undefined,
  paymentRequestDate: Date,
): boolean => {
  const now = new Date();
  const intervalHours = CONSTANTS.NAG_INTERVALS[nagSensitivity];

  // if no reminder has been sent yet, check against payment request date
  const referenceDate = lastReminderDate || paymentRequestDate;
  const hoursSinceLastContact =
    (now.getTime() - new Date(referenceDate).getTime()) / (1000 * 60 * 60);

  // Send reminder if enough time has passed
  return hoursSinceLastContact >= intervalHours;
};

// process a single debt for reminder eligibility
const processDebtForReminder = async (debt: any): Promise<boolean> => {
  try {
    const debtData = getModelData(debt);

    // get debtor info (registered or non-registered)
    let debtorId: string | null = null;
    let nagSensitivity: "low" | "medium" | "high" = "medium";

    if (debtData.debtorId && debt.get("debtor")) {
      const debtor = getModelData(debt.get("debtor"));
      debtorId = debtor.id;
      nagSensitivity = debtor.nagSensitivity || "medium";
    } else {
      // non-registered user - use default medium sensitivity
      nagSensitivity = "medium";
    }

    // get the last reminder sent for this debt
    const lastReminder = await Notification.findOne({
      where: {
        debtId: debtData.id,
        ...(debtorId ? { userId: debtorId } : {}),
        type: "payment_reminder",
      },
      order: [["sentAt", "DESC"]],
    });

    const lastReminderData = lastReminder ? getModelData(lastReminder) : null;

    // determine if we should send a reminder based on nag sensitivity
    const shouldSend = shouldSendReminder(
      nagSensitivity,
      lastReminderData?.sentAt,
      debtData.updatedAt,
    );

    if (shouldSend) {
      await sendPaymentReminder(debtData.id);
      logger.info(
        `Reminder sent for debt ${debtData.id} (nag sensitivity: ${nagSensitivity})`,
      );
      return true;
    }

    return false;
  } catch (error) {
    logger.error(`Failed to send reminder for debt:`, error);
    return false;
  }
};

// check and send reminders for debts awaiting payment
const checkAndSendReminders = async (): Promise<void> => {
  try {
    // find all debts that are in payment_requested status (both registered and non-registered)
    const pendingPaymentDebts = await Debt.findAll({
      where: {
        status: "payment_requested",
      },
      include: [
        {
          model: User,
          as: "debtor",
          attributes: ["id", "email", "name", "nagSensitivity"],
          required: false, // LEFT JOIN - include debts without registered debtors
        },
      ],
    });

    if (pendingPaymentDebts.length === 0) {
      logger.info("No debts waiting for payment found");
      return;
    }

    logger.info(
      `Checking ${pendingPaymentDebts.length} debts for reminder eligibility`,
    );

    // process each debt and count reminders sent
    const results = await Promise.all(
      pendingPaymentDebts.map(processDebtForReminder),
    );

    const remindersSent = results.filter(Boolean).length;

    logger.info(
      `Sent ${remindersSent} reminders out of ${pendingPaymentDebts.length} debts`,
    );
  } catch (error) {
    logger.error("Error checking and sending reminders:", error);
    throw error;
  }
};

// job executor that runs the nag reminder worker
const runNagReminder = async () => {
  if (isRunning) {
    logger.warn(
      "Nag reminder worker is already running, skipping this iteration",
    );
    return;
  }

  isRunning = true;
  logger.info("Starting nag reminder worker");

  try {
    await checkAndSendReminders();
  } catch (error) {
    logger.error("Error in nag reminder worker:", error);
  } finally {
    isRunning = false;
  }
};

// start the nag reminder worker
export const startNagReminder = (): void => {
  // run every hour at 15 minutes past the hour (offset from debt checker)
  cron.schedule("15 * * * *", runNagReminder);
  logger.info("Nag reminder worker scheduled successfully (runs every hour)");
};

export const runNagReminderNow = async (): Promise<void> => {
  logger.info("Manually triggering nag reminder worker");
  await checkAndSendReminders();
};
