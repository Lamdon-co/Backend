import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as AppleStrategy } from "passport-apple";
import User from "../models/user.model";

// console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);
// console.log("Google Client Secret:", process.env.GOOGLE_CLIENT_SECRET);


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
        let user = await User.findOne({
          providerId: profile.id,
          authProvider: "google",
        });

        if (!user) {
          user = await User.create({
            providerId: profile.id,
            email: profile.emails?.[0].value,
            firstname: profile.name?.givenName,
            lastname: profile.name?.familyName,
            authProvider: "google",
          });
        }

        return done(null, user);
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
        let user = await User.findOne({
          providerId: profile.id,
          authProvider: "facebook",
        });

        if (!user) {
          user = await User.create({
            providerId: profile.id,
            email: profile.emails?.[0].value,
            firstname: profile.name?.givenName,
            lastname: profile.name?.familyName,
            authProvider: "facebook",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Apple OAuth Strategy
// passport.use(
//   new AppleStrategy(
//     {
//       clientID: process.env.APPLE_CLIENT_ID!,
//       teamID: process.env.APPLE_TEAM_ID!,
//       keyID: process.env.APPLE_KEY_ID!,
//       privateKey: process.env.APPLE_PRIVATE_KEY!,
//       callbackURL: "/api/auth/apple/callback",
//       scope: ["name", "email"],
//     },
//     async (
//       _accessToken: string,
//       _refreshToken: string,
//       profile: {
//         id: string;
//         email: string;
//         name: { firstName: string; lastName: string };
//       },
//       done: any
//     ) => {
//       try {
//         let user = await User.findOne({
//           providerId: profile.id,
//           authProvider: "apple",
//         });

//         if (!user) {
//           user = await User.create({
//             providerId: profile.id,
//             email: profile.email,
//             firstname: profile.name?.firstName,
//             lastname: profile.name?.lastName,
//             authProvider: "apple",
//           });
//         }

//         return done(null, user);
//       } catch (error) {
//         return done(error, false);
//       }
//     }
//   )
// );

// Serialize & Deserialize User
passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => done(null, user))
    .catch((err) => done(err, null));
});

export default passport;
