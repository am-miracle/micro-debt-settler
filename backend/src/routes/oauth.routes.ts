import { Router } from "express";
import passport from "../config/passport";
import * as oauthController from "../controllers/oauth.controller";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/v1/oauth/google/failure",
  }),
  oauthController.googleCallback,
);

router.get("/google/failure", oauthController.googleFailure);

router.post("/google/mobile", oauthController.googleMobileAuth);

export default router;
