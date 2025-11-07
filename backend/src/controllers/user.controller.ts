import { Request, Response, NextFunction } from "express";
import { User } from "../models";
import { ApiResponse } from "../utils/helpers";
import { AppError } from "../middleware/error.middleware";
import * as userService from "../services/user.service";

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { name, phone, nagSensitivity } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    await user.update({ name, phone, nagSensitivity });

    const { password: _password, ...userWithoutPassword } = user.toJSON();

    ApiResponse.success(
      res,
      userWithoutPassword,
      "Profile updated successfully",
    );
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError("Current password is incorrect", 400);
    }

    // Update password
    await user.update({ password: newPassword });

    ApiResponse.success(res, null, "Password changed successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { password } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError("Password is incorrect", 400);
    }

    // Delete user (cascade will handle related records)
    await user.destroy();

    ApiResponse.success(res, null, "Account deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get user settings with stats
 */
export const getSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.userId!;
    const settings = await userService.getUserSettings(userId);
    ApiResponse.success(res, settings, "Settings retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Update user settings
 */
export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.userId!;
    const updatedUser = await userService.updateUserSettings(userId, req.body);
    ApiResponse.success(res, updatedUser, "Settings updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment history
 */
export const getPaymentHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { page, limit, status, paymentMethod } = req.query;

    const history = await userService.getPaymentHistory(userId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as string,
      paymentMethod: paymentMethod as string,
    });

    ApiResponse.success(res, history, "Payment history retrieved successfully");
  } catch (error) {
    next(error);
  }
};
