import express from "express";
import passport from "passport";
import { signUp, signIn, completeSignup, sendVerification, verifyEmail } from "../controllers/auth.controller";
import "../config/passport"; // Import passport configurations
import { signupSchema } from "../validators/authValidator";
import validateRequest from "../middlewares/validateRequest";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = express.Router();

// Email & Password Authentication
router.post("/signup", validateRequest(signupSchema), signUp);
router.post("/signin", signIn);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const user = req.user as any;
    res.json({ status: "success", user, token: user ? user.token : null });
  }
);

// Facebook OAuth
router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  (req, res) => {
    const user = req.user as any;
    res.json({ status: "success", user, token: user ? user.token : null });
  }
);

// Apple OAuth
router.get("/apple", passport.authenticate("apple"));
router.get(
  "/apple/callback",
  passport.authenticate("apple", { session: false }),
  (req, res) => {
    const user = req.user as any;
    res.json({ status: "success", user, token: user ? user.token : null });
  }
);

router.post("/complete-signup", asyncHandler(completeSignup));
router.post("/send-verification", sendVerification);
router.post("/verify-email", verifyEmail);

export default router;
