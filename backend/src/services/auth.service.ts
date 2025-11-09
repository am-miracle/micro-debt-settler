import jwt from "jsonwebtoken";
import { User } from "../models";
import { config } from "../config/env";
import { CONSTANTS } from "../utils/constants";
import { AppError } from "../middleware/error.middleware";

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  nagSensitivity?: "low" | "medium" | "high";
}

interface LoginData {
  email: string;
  password: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const generateTokens = (userId: string, email: string): TokenPair => {
  const accessToken = jwt.sign({ userId, email }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign({ userId, email }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
};

export const register = async (data: RegisterData) => {
  const existingUser = await User.findOne({ where: { email: data.email } });
  if (existingUser) {
    throw new AppError(CONSTANTS.ERRORS.EMAIL_EXISTS, 400);
  }

  // Create user
  const user = await User.create({
    email: data.email,
    passwordHash: data.password, // map password to passwordHash, will be hashed by hook
    name: data.name,
    phone: data.phone,
    nagSensitivity: data.nagSensitivity || "medium",
  });

  const tokens = generateTokens(user.id, user.email);

  // remove password from response
  const { passwordHash: _passwordHash, ...userWithoutPassword } = user.toJSON();

  return {
    user: userWithoutPassword,
    ...tokens,
  };
};

export const login = async (data: LoginData) => {
  const user = await User.findOne({ where: { email: data.email } });
  if (!user) {
    const errorMessage =
      config.env === "development"
        ? "No account found with this email address"
        : CONSTANTS.ERRORS.INVALID_CREDENTIALS;
    throw new AppError(errorMessage, 401);
  }

  const isPasswordValid = await (user as any).comparePassword(data.password);
  if (!isPasswordValid) {
    const errorMessage =
      config.env === "development"
        ? "Password is incorrect"
        : CONSTANTS.ERRORS.INVALID_CREDENTIALS;
    throw new AppError(errorMessage, 401);
  }

  const tokens = generateTokens(user.id, user.email);

  const { passwordHash: _passwordHash2, ...userWithoutPassword } =
    user.toJSON();

  return {
    user: userWithoutPassword,
    ...tokens,
  };
};

export const refreshToken = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
      userId: string;
      email: string;
    };

    // check if user still exists
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      throw new AppError(CONSTANTS.ERRORS.UNAUTHORIZED, 401);
    }

    const tokens = generateTokens(user.id, user.email);
    return tokens;
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }
};
