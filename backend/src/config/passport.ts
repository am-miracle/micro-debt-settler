import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "./env";
import { User } from "../models";

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.redirectUri,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        // check if user already exists with this google ID
        let user = await User.findOne({
          where: { googleId: profile.id },
        });

        if (user) {
          // user exists, return user
          return done(null, user);
        }

        // check if user exists with this email
        user = await User.findOne({
          where: { email: profile.emails?.[0]?.value },
        });

        if (user) {
          // user exists with email but no googleId, link accounts
          await user.update({
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value,
          });
          return done(null, user);
        }

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
