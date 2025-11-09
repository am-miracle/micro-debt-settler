import { startDebtChecker, runDebtCheckerNow } from "./debtChecker.worker";
import { startNagReminder, runNagReminderNow } from "./nagReminder.worker";
import { logger } from "../utils/logger";

export const startAllWorkers = (): void => {
  try {
    logger.info("Starting all workers...");

    // start debt checker worker
    startDebtChecker();

    // start nag reminder worker
    startNagReminder();

    logger.info("All workers started successfully");
  } catch (error) {
    logger.error("Failed to start workers:", error);
    throw error;
  }
};

export const triggerDebtChecker = async (): Promise<void> => {
  await runDebtCheckerNow();
};

export const triggerNagReminder = async (): Promise<void> => {
  await runNagReminderNow();
};
