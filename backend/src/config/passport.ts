import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "./env";
import { User } from "../models";

/**
 * Serialize user for session
 */
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

/**
 * Deserialize user from session
 */
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

/**
 * Google OAuth Strategy
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.redirectUri,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({
          where: { googleId: profile.id },
        });

        if (user) {
          // User exists, return user
          return done(null, user);
        }

        // Check if user exists with this email
        user = await User.findOne({
          where: { email: profile.emails?.[0]?.value },
        });

        if (user) {
          // User exists with email but no googleId, link accounts
          await user.update({
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value,
          });
          return done(null, user);
        }

        // Create new user
        const newUser = await User.create({
          googleId: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value,
          password: null, // OAuth users don't have passwords
          nagSensitivity: "medium",
        });

        return done(null, newUser);
      } catch (error) {
        return done(error as Error, undefined);
      }
    },
  ),
);

export default passport;
