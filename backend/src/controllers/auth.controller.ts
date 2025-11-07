import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { ApiResponse } from "../utils/helpers";
import { CONSTANTS } from "../utils/constants";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password, name, phone, nagSensitivity } = req.body;

    const result = await authService.register({
      email,
      password,
      name,
      phone,
      nagSensitivity,
    });

    ApiResponse.success(res, result, CONSTANTS.SUCCESS.USER_REGISTERED, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    ApiResponse.success(res, result, CONSTANTS.SUCCESS.LOGIN_SUCCESS);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    const tokens = await authService.refreshToken(refreshToken);

    ApiResponse.success(res, tokens, "Token refreshed successfully");
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    ApiResponse.success(res, req.user, "User retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Since we're using JWT (stateless), logout is handled client-side
    // Client should delete the tokens from storage
    // Optionally, you can implement token blacklisting here
    ApiResponse.success(res, null, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};
