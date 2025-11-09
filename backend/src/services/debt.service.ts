import { Debt, User, Transaction } from "../models";
import {
  CreateDebtDTO,
  CreateReceivableDebtDTO,
  UpdateDebtDTO,
  DebtQueryParams,
} from "../types/debt.types";
import { AppError } from "../middleware/error.middleware";
import { CONSTANTS } from "../utils/constants";
import { calculateDueDate } from "../utils/helpers";
import { config } from "../config/env";
import { Op } from "sequelize";
import { getModelData } from "../utils/sequelize-helpers";
import {
  sendDebtCreatedNotification,
  sendCreditorDebtNotification,
} from "./notification.service";
import { logger } from "../utils/logger";

// create a debt where the logged-in user is the debtor (owes money)
// supports both registered users and non-registered creditors (personal reminders)
export const createDebt = async (debtorId: string, data: CreateDebtDTO) => {
  let isPersonalReminder = false;

  // check if this is a debt to a registered user or a personal reminder
  if (data.creditorId) {
    // registered user debt
    const creditor = await User.findByPk(data.creditorId);
    if (!creditor) {
      throw new AppError("Creditor not found", 404);
    }

    if (debtorId === data.creditorId) {
      throw new AppError("Cannot create debt to yourself", 400);
    }
  } else {
    // personal reminder - must have at least creditor name or email or phone
    if (!data.creditorName && !data.creditorEmail && !data.creditorPhone) {
      throw new AppError(
        "For personal reminders, provide at least creditor name, email, or phone",
        400,
      );
    }
    isPersonalReminder = true;
  }

  const dueDate = data.dueDate
    ? new Date(data.dueDate)
    : calculateDueDate(config.debt.defaultDeadlineHours);

  const debt = await Debt.create({
    debtorId,
    creditorId: data.creditorId || null,
    creditorName: data.creditorName || null,
    creditorEmail: data.creditorEmail || null,
    creditorPhone: data.creditorPhone || null,
    isPersonalReminder,
    amount: data.amount,
    currency: data.currency,
    description: data.description,
    debtorName: data.debtorName,
    paymentMethod: data.paymentMethod || null,
    bankName: data.bankName,
    accountName: data.accountName,
    accountNumber: data.accountNumber,
    status: "pending",
    dueDate,
    calendarEventId: data.calendarEventId,
  });

  // send notification to creditor (registered or non-registered)
  const debtData = getModelData(debt);
  if (data.creditorId || data.creditorEmail || data.creditorPhone) {
    // For debts I owe, notify the creditor that i've acknowledged the debt
    sendCreditorDebtNotification(debtData.id).catch((error) => {
      logger.error("Failed to send creditor notification:", error);
    });
  }

  return debt;
};

// create a debt where the logged-in user is the creditor (is owed money)
// supports both registered users and non-registered debtors (receivable reminders)
export const createReceivableDebt = async (
  creditorId: string,
  data: CreateReceivableDebtDTO,
) => {
  let isPersonalReminder = false;

  // check if this is a debt from a registered user
  if (data.debtorId) {
    // registered user debt
    const debtor = await User.findByPk(data.debtorId);
    if (!debtor) {
      throw new AppError("Debtor not found", 404);
    }

    if (creditorId === data.debtorId) {
      throw new AppError("Cannot create debt to yourself", 400);
    }
  } else {
    // personal reminder - must have at least debtor name or email or phone
    if (!data.debtorName && !data.debtorEmail && !data.debtorPhone) {
      throw new AppError(
        "For personal reminders, provide at least debtor name, email, or phone",
        400,
      );
    }
    isPersonalReminder = true;
  }

  const dueDate = data.dueDate
    ? new Date(data.dueDate)
    : calculateDueDate(config.debt.defaultDeadlineHours);

  const debt = await Debt.create({
    debtorId: data.debtorId || null,
    debtorName: data.debtorName || null,
    debtorEmail: data.debtorEmail || null,
    debtorPhone: data.debtorPhone || null,
    creditorId,
    isPersonalReminder,
    amount: data.amount,
    currency: data.currency,
    description: data.description,
    creditorName: data.creditorName,
    paymentMethod: data.paymentMethod || null,
    bankName: data.bankName,
    accountName: data.accountName,
    accountNumber: data.accountNumber,
    status: "pending",
    dueDate,
    calendarEventId: data.calendarEventId,
  });

  // send notification to debtor (registered or non-registered)
  const debtData = getModelData(debt);
  if (data.debtorId || data.debtorEmail || data.debtorPhone) {
    sendDebtCreatedNotification(debtData.id).catch((error) => {
      // log error but don't fail debt creation
      logger.error("Failed to send debt notification:", error);
    });
  }

  return debt;
};

export const getDebtById = async (debtId: string, userId: string) => {
  const debt = await Debt.findByPk(debtId, {
    include: [
      { model: User, as: "debtor", attributes: ["id", "email", "name"] },
      { model: User, as: "creditor", attributes: ["id", "email", "name"] },
      { model: Transaction, as: "transactions" },
    ],
  });

  if (!debt) {
    throw new AppError(CONSTANTS.ERRORS.DEBT_NOT_FOUND, 404);
  }

  const debtData = getModelData(debt);
  if (debtData.debtorId !== userId && debtData.creditorId !== userId) {
    throw new AppError(CONSTANTS.ERRORS.FORBIDDEN, 403);
  }

  return debt;
};

export const getDebts = async (userId: string, params: DebtQueryParams) => {
  const {
    status,
    debtorId,
    creditorId,
    fromDate,
    toDate,
    page = CONSTANTS.PAGINATION.DEFAULT_PAGE,
    limit = CONSTANTS.PAGINATION.DEFAULT_LIMIT,
  } = params;

  const where: any = {
    [Op.or]: [{ debtorId: userId }, { creditorId: userId }],
  };

  if (status) where.status = status;
  if (debtorId) where.debtorId = debtorId;
  if (creditorId) where.creditorId = creditorId;
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt[Op.gte] = new Date(fromDate);
    if (toDate) where.createdAt[Op.lte] = new Date(toDate);
  }

  const offset = (page - 1) * limit;

  const { rows: debts, count: total } = await Debt.findAndCountAll({
    where,
    include: [
      { model: User, as: "debtor", attributes: ["id", "email", "name"] },
      { model: User, as: "creditor", attributes: ["id", "email", "name"] },
    ],
    limit: Math.min(limit, CONSTANTS.PAGINATION.MAX_LIMIT),
    offset,
    order: [["createdAt", "DESC"]],
  });

  return { debts, total, page, limit };
};

export const getDebtsByDirection = async (
  userId: string,
  direction: "owed" | "receivable",
  params: DebtQueryParams,
) => {
  const {
    status,
    fromDate,
    toDate,
    page = CONSTANTS.PAGINATION.DEFAULT_PAGE,
    limit = CONSTANTS.PAGINATION.DEFAULT_LIMIT,
  } = params;

  const where: any =
    direction === "owed" ? { debtorId: userId } : { creditorId: userId };

  if (status) where.status = status;
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt[Op.gte] = new Date(fromDate);
    if (toDate) where.createdAt[Op.lte] = new Date(toDate);
  }

  const offset = (page - 1) * limit;

  const { rows: debts, count: total } = await Debt.findAndCountAll({
    where,
    include: [
      { model: User, as: "debtor", attributes: ["id", "email", "name"] },
      { model: User, as: "creditor", attributes: ["id", "email", "name"] },
    ],
    limit: Math.min(limit, CONSTANTS.PAGINATION.MAX_LIMIT),
    offset,
    order: [["createdAt", "DESC"]],
  });

  return { debts, total, page, limit, direction };
};

export const updateDebt = async (
  debtId: string,
  userId: string,
  data: UpdateDebtDTO,
) => {
  const debt = await Debt.findByPk(debtId);

  if (!debt) {
    throw new AppError(CONSTANTS.ERRORS.DEBT_NOT_FOUND, 404);
  }

  const debtData = getModelData(debt);

  if (debtData.debtorId !== userId && debtData.creditorId !== userId) {
    throw new AppError(CONSTANTS.ERRORS.FORBIDDEN, 403);
  }

  if ((data.amount || data.description) && debtData.debtorId !== userId) {
    throw new AppError("Only debtor can update amount or description", 403);
  }

  if (data.status) {
    const allowedTransitions = (CONSTANTS.DEBT_STATUS_FLOW as any)[
      debtData.status
    ] as string[];
    if (!allowedTransitions.includes(data.status)) {
      throw new AppError(CONSTANTS.ERRORS.INVALID_STATUS_TRANSITION, 400);
    }
  }

  await debt.update(data);
  return debt;
};

export const deleteDebt = async (debtId: string, userId: string) => {
  const debt = await Debt.findByPk(debtId);

  if (!debt) {
    throw new AppError(CONSTANTS.ERRORS.DEBT_NOT_FOUND, 404);
  }

  const debtData = getModelData(debt);

  if (debtData.debtorId !== userId && debtData.creditorId !== userId) {
    throw new AppError(CONSTANTS.ERRORS.FORBIDDEN, 403);
  }

  if (debtData.status !== "pending") {
    throw new AppError("Can only delete pending debts", 400);
  }

  await debt.destroy();
};

export const getDebtSummary = async (userId: string) => {
  const [owedDebts, receivableDebts] = await Promise.all([
    Debt.findAll({
      where: { debtorId: userId, status: { [Op.ne]: "settled" } },
      attributes: ["amount", "currency", "status"],
    }),
    Debt.findAll({
      where: { creditorId: userId, status: { [Op.ne]: "settled" } },
      attributes: ["amount", "currency", "status"],
    }),
  ]);

  const calculateTotal = (debts: any[]) => {
    return debts.reduce(
      (acc, debt) => {
        const data = getModelData(debt);
        const currency = data.currency;
        if (!acc[currency]) acc[currency] = 0;
        acc[currency] += Number(data.amount);
        return acc;
      },
      {} as Record<string, number>,
    );
  };

  return {
    totalOwed: calculateTotal(owedDebts),
    totalReceivable: calculateTotal(receivableDebts),
    owedCount: owedDebts.length,
    receivableCount: receivableDebts.length,
  };
};
