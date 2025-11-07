import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { config } from "../config/env";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Log error
  logger.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Default error values
  let statusCode = 500;
  let message = "Internal server error";

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle Sequelize errors
  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    statusCode = 400;
    message = "Validation error";
  }

  if (err.name === "SequelizeForeignKeyConstraintError") {
    statusCode = 400;
    message = "Invalid reference";
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    ...(config.env === "development" && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.url} not found`,
  });
};
