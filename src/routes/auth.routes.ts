import express from "express";
import passport from "passport";
import { signUp, signIn, completeSignup, sendVerification, verifyEmail, googleAuth, googleAuthCallback, facebookAuth, facebookAuthCallback } from "../controllers/auth.controller";
import "../config/passport"; // Import passport configurations
import { signupSchema } from "../validators/authValidator";
import validateRequest from "../middlewares/validateRequest";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = express.Router();

// Email & Password Authentication
router.post("/signup", validateRequest(signupSchema), signUp);
router.post("/signin", signIn);

// Google OAuth
router.get("/google", googleAuth);
router.get("/google/callback", googleAuthCallback);

// Facebook OAuth
router.get("/facebook", facebookAuth);
router.get("/facebook/callback", facebookAuthCallback);

router.post("/complete-signup", asyncHandler(completeSignup));
router.post("/send-verification", sendVerification);
router.post("/verify-email", verifyEmail);

export default router;
