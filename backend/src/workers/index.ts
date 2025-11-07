import { startDebtChecker, runDebtCheckerNow } from "./debtChecker.worker";
import { startNagReminder, runNagReminderNow } from "./nagReminder.worker";
import { logger } from "../utils/logger";

/**
 * Start all workers
 */
export const startAllWorkers = (): void => {
  try {
    logger.info("Starting all workers...");

    // Start debt checker worker
    startDebtChecker();

    // Start nag reminder worker
    startNagReminder();

    logger.info("All workers started successfully");
  } catch (error) {
    logger.error("Failed to start workers:", error);
    throw error;
  }
};

/**
 * Run debt checker manually (for testing)
 */
export const triggerDebtChecker = async (): Promise<void> => {
  await runDebtCheckerNow();
};

/**
 * Run nag reminder manually (for testing)
 */
export const triggerNagReminder = async (): Promise<void> => {
  await runNagReminderNow();
};
