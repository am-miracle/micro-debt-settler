import { Request, Response, NextFunction } from "express";
import * as debtService from "../services/debt.service";
import { ApiResponse } from "../utils/helpers";
import { CONSTANTS } from "../utils/constants";

/**
 * Create a debt where YOU owe money to someone
 * Use case: "I owe John $20 for drinks"
 */
export const createDebt = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      creditorId,
      creditorName,
      creditorEmail,
      creditorPhone,
      amount,
      currency,
      description,
      debtorName,
      dueDate,
      bankName,
      accountName,
      accountNumber,
      calendarEventId,
    } = req.body;
    const debtorId = req.userId!;

    const debt = await debtService.createDebt(debtorId, {
      creditorId,
      creditorName,
      creditorEmail,
      creditorPhone,
      amount,
      currency,
      description,
      debtorName,
      dueDate,
      bankName,
      accountName,
      accountNumber,
      calendarEventId,
    });

    ApiResponse.success(res, debt, CONSTANTS.SUCCESS.DEBT_CREATED, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a debt where someone OWES YOU money
 * Use case: "John owes me $20 for drinks"
 */
export const createReceivableDebt = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      debtorId,
      debtorName,
      debtorEmail,
      debtorPhone,
      amount,
      currency,
      description,
      creditorName,
      dueDate,
      bankName,
      accountName,
      accountNumber,
      calendarEventId,
    } = req.body;
    const creditorId = req.userId!;

    const debt = await debtService.createReceivableDebt(creditorId, {
      debtorId,
      debtorName,
      debtorEmail,
      debtorPhone,
      amount,
      currency,
      description,
      creditorName,
      dueDate,
      bankName,
      accountName,
      accountNumber,
      calendarEventId,
    });

    ApiResponse.success(res, debt, "Receivable debt created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getDebt = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const debt = await debtService.getDebtById(id, userId);

    ApiResponse.success(res, debt, "Debt retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const getDebts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { status, debtorId, creditorId, fromDate, toDate, page, limit } =
      req.query;

    const result = await debtService.getDebts(userId, {
      status: status as string,
      debtorId: debtorId as string,
      creditorId: creditorId as string,
      fromDate: fromDate as string,
      toDate: toDate as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    ApiResponse.paginated(
      res,
      result.debts,
      result.page,
      result.limit,
      result.total,
      "Debts retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get debts by direction (what you owe vs what you're owed)
 */
export const getDebtsByDirection = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { direction } = req.params;
    const { status, fromDate, toDate, page, limit } = req.query;

    if (direction !== "owed" && direction !== "receivable") {
      ApiResponse.error(res, 'Direction must be "owed" or "receivable"', 400);
      return;
    }

    const result = await debtService.getDebtsByDirection(userId, direction, {
      status: status as string,
      fromDate: fromDate as string,
      toDate: toDate as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    ApiResponse.paginated(
      res,
      result.debts,
      result.page,
      result.limit,
      result.total,
      `${direction === "owed" ? "Debts you owe" : "Debts owed to you"} retrieved successfully`,
    );
  } catch (error) {
    next(error);
  }
};

export const updateDebt = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const updateData = req.body;

    const debt = await debtService.updateDebt(id, userId, updateData);

    ApiResponse.success(res, debt, CONSTANTS.SUCCESS.DEBT_UPDATED);
  } catch (error) {
    next(error);
  }
};

export const deleteDebt = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    await debtService.deleteDebt(id, userId);

    ApiResponse.success(res, null, CONSTANTS.SUCCESS.DEBT_DELETED);
  } catch (error) {
    next(error);
  }
};

export const getDebtSummary = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.userId!;

    const summary = await debtService.getDebtSummary(userId);

    ApiResponse.success(res, summary, "Debt summary retrieved successfully");
  } catch (error) {
    next(error);
  }
};
