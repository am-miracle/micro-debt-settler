import cron from "node-cron";
import { Debt } from "../models";
import { sendPaymentRequest } from "../services/notification.service";
import { logger } from "../utils/logger";
import { Op } from "sequelize";

let isRunning = false;

/**
 * Check and process overdue debts
 */
const checkAndProcessDebts = async (): Promise<void> => {
  try {
    const now = new Date();

    // Find all pending debts that have passed their due date
    const overdueDebts = await Debt.findAll({
      where: {
        status: "pending",
        dueDate: {
          [Op.lte]: now,
        },
      },
    });

    if (overdueDebts.length === 0) {
      logger.info("No overdue debts found");
      return;
    }

    logger.info(`Found ${overdueDebts.length} overdue debts to process`);

    // Process each debt
    const processDebt = async (debt: any) => {
      try {
        // Send payment request notification
        await sendPaymentRequest(debt.id);

        // Update status to payment_requested and timestamp
        await debt.update({
          status: "payment_requested",
          paymentRequestedAt: new Date(),
        });

        logger.info(`Payment request sent for debt ${debt.id}`);
      } catch (error) {
        logger.error(`Failed to process debt ${debt.id}:`, error);
      }
    };

    await Promise.all(overdueDebts.map(processDebt));

    logger.info(`Successfully processed ${overdueDebts.length} debts`);
  } catch (error) {
    logger.error("Error checking and processing debts:", error);
    throw error;
  }
};

/**
 * Job executor that runs the debt checker
 */
const runDebtChecker = async () => {
  if (isRunning) {
    logger.warn("Debt checker is already running, skipping this iteration");
    return;
  }

  isRunning = true;
  logger.info("Starting debt checker worker");

  try {
    await checkAndProcessDebts();
  } catch (error) {
    logger.error("Error in debt checker worker:", error);
  } finally {
    isRunning = false;
  }
};

/**
 * Start the debt checker worker
 */
export const startDebtChecker = (): void => {
  // Run every hour at the top of the hour
  cron.schedule("0 * * * *", runDebtChecker);
  logger.info("Debt checker worker scheduled successfully (runs every hour)");
};

/**
 * Manual trigger for testing
 */
export const runDebtCheckerNow = async (): Promise<void> => {
  logger.info("Manually triggering debt checker");
  await checkAndProcessDebts();
};
