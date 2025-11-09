import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { User } from "../models";
import { ApiResponse } from "../utils/helpers";
import { CONSTANTS } from "../utils/constants";

interface JwtPayload {
  userId: string;
  email: string;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      ApiResponse.error(res, CONSTANTS.ERRORS.UNAUTHORIZED, 401);
      return;
    }

    const token = authHeader.substring(7);

    // verify token
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // find user
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["passwordHash"] },
    });

    if (!user) {
      ApiResponse.error(res, CONSTANTS.ERRORS.UNAUTHORIZED, 401);
      return;
    }

    // attach user to request
    req.user = user.toJSON();
    req.userId = user.id;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      ApiResponse.error(res, "Invalid token", 401);
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      ApiResponse.error(res, "Token expired", 401);
      return;
    }
    ApiResponse.error(res, CONSTANTS.ERRORS.INTERNAL_SERVER, 500);
  }
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ["passwordHash"] },
      });

      if (user) {
        req.user = user.toJSON();
        req.userId = user.id;
      }
    }

    next();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    // for optional auth, we just continue without user
    next();
  }
};
