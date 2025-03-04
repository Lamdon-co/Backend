import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { AppError } from "../middlewares/errorHandler";

// Helper function to handle OAuth login or registration
const handleOAuthUser = async (
  provider: "google" | "facebook",
  profile: any
) => {
  try {
    let user = await User.findOne({ providerId: profile.id, authProvider: provider });

    if (!user) {
      // Create new user if they don’t exist
      user = await User.create({
        providerId: profile.id,
        email: profile.emails?.[0]?.value,
        firstname: profile.name?.givenName,
        lastname: profile.name?.familyName,
        authProvider: provider,
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });

    return { user, token };
  } catch (error) {
    throw new AppError("OAuth Authentication Failed", 500);
  }
};

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/v1/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const { user, token } = await handleOAuthUser("google", profile);
        return done(null, { user, token });
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Facebook OAuth Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      callbackURL: "/v1/auth/facebook/callback",
      profileFields: ["id", "emails", "name"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const { user, token } = await handleOAuthUser("facebook", profile);
        return done(null, { user, token });
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Serialize & Deserialize User
passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

export default passport;
