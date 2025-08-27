import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      passReqToCallback: true,
    },
    async (_req, _accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile?.emails?.[0]?.value;
        const name = profile?.displayName || (email ? email.split("@")[0] : "Google User");
        const picture = profile?.photos?.[0]?.value || "";

        if (!email) {
          return done(new Error("No email provided by Google"));
        }

        let user = await User.findOne({ email });

        if (!user) {
          const randomPassword = Math.random().toString(36).slice(-12);
          const hashedPassword = await bcrypt.hash(randomPassword, 12);

          user = await User.create({
            fullName: name,
            email,
            password: hashedPassword,
            profilePic: picture,
          });

          try {
            await upsertStreamUser({
              id: user._id.toString(),
              name: user.fullName,
              image: user.profilePic || "",
            });
          } catch (err) {
            // non-fatal
            // eslint-disable-next-line no-console
            console.error("Error creating Stream user:", err?.message || err);
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

export default passport;


