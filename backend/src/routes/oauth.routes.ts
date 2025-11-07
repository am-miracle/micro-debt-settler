import { Router } from "express";
import passport from "../config/passport";
import * as oauthController from "../controllers/oauth.controller";

const router = Router();

/**
 * @route   GET /api/v1/oauth/google
 * @desc    Initiate Google OAuth flow
 * @access  Public
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

/**
 * @route   GET /api/v1/oauth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/v1/oauth/google/failure",
  }),
  oauthController.googleCallback,
);

/**
 * @route   GET /api/v1/oauth/google/failure
 * @desc    Handle Google OAuth failure
 * @access  Public
 */
router.get("/google/failure", oauthController.googleFailure);

/**
 * @route   POST /api/v1/oauth/google/mobile
 * @desc    Handle Google Sign-In from mobile app (React Native)
 * @access  Public
 */
router.post("/google/mobile", oauthController.googleMobileAuth);

export default router;
