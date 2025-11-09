import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { getModelData } from "../utils/sequelize-helpers";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models";

export const googleCallback = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user as any;

    if (!user) {
      res.redirect(
        `${config.app.frontendUrls[0]}/auth/error?message=Authentication failed`,
      );
      return;
    }

    const userData = getModelData(user);

    // generate access token
    const accessToken = jwt.sign(
      { userId: userData.id, email: userData.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions,
    );

    // generate refresh token
    const refreshToken = jwt.sign(
      { userId: userData.id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions,
    );

    // redirect to frontend with tokens
    const redirectUrl = `${config.app.frontendUrls[0]}/auth/success?accessToken=${accessToken}&refreshToken=${refreshToken}`;
    res.redirect(redirectUrl);
  } catch {
    res.redirect(
      `${config.app.frontendUrls[0]}/auth/error?message=Token generation failed`,
    );
  }
};

export const googleFailure = (_req: Request, res: Response): void => {
  res.redirect(
    `${config.app.frontendUrls[0]}/auth/error?message=Google authentication failed`,
  );
};

export const googleMobileAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({
        success: false,
        message: "Google ID token is required",
      });
      return;
    }

    // verify the Google ID token
    const client = new OAuth2Client(config.google.clientId);

    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.google.clientId,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      res.status(400).json({
        success: false,
        message: "Invalid Google token",
      });
      return;
    }

    // check if user exists or create new user
    let user = await User.findOne({ where: { email: payload.email } });

    if (!user) {
      // create new user
      user = await User.create({
        email: payload.email,
        name: payload.name || payload.email,
        googleId: payload.sub,
        avatarUrl: payload.picture,
        isVerified: true,
        verifiedAt: new Date(),
      });
    } else if (!user.googleId) {
      // link Google account to existing user
      await user.update({
        googleId: payload.sub,
        avatarUrl: payload.picture || user.avatarUrl,
      });
    }

    const userData = getModelData(user);

    const accessToken = jwt.sign(
      { userId: userData.id, email: userData.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions,
    );

    const refreshToken = jwt.sign(
      { userId: userData.id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions,
    );

    // remove sensitive data
    const { passwordHash: _passwordHash, ...userWithoutPassword } = userData;

    res.json({
      success: true,
      message: "Google authentication successful",
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};
