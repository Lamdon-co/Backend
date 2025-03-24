import { NextFunction, Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";
import {
  completeSignupSchema,
  validateSendVerification,
  validateSignIn,
  validateVerifyEmail,
} from "../validators/authValidator";
import { AppError } from "../middlewares/errorHandler";
import User, { IUser } from "../models/user.model";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  generateVerificationCode,
  sendVerificationEmail,
} from "../services/email.service";
import passport from "../config/passport";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  generateRefreshToken,
  generateToken,
  verifyRefreshToken,
} from "../utils/generateToken";

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

interface AuthRequest extends Request {
  user?: any;
}

export const googleAuthCallback = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("google", { session: false }, (err, data) => {
    if (err || !data)
      return res
        .status(401)
        .json({ status: "error", message: "Authentication failed" });

    res.status(200).json({
      status: "success",
      message: "Google authentication successful",
      token: data.token,
      user: data.user,
    });
  })(req, res, next);
};

export const facebookAuth = passport.authenticate("facebook", {
  scope: ["email"],
});

export const facebookAuthCallback = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "facebook",
    { session: false },
    (err: any, data: { token: string; user: IUser }) => {
      if (err || !data)
        return res
          .status(401)
          .json({ status: "error", message: "Authentication failed" });

      res.status(200).json({
        status: "success",
        message: "Facebook authentication successful",
        token: data.token,
        user: data.user,
      });
    }
  )(req, res, next);
};

export const signUp = async (req: Request, res: Response) => {
  try {
    const { email, phone, password, authProvider, providerId } = req.body;
    const { user } = await registerUser(
      email,
      phone,
      password,
      authProvider,
      providerId
    );

    res.status(201).json({
      status: "success",
      user: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const completeSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error } = completeSignupSchema.validate(req.body);
    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }

    const { userId, firstName, lastName, dateOfBirth } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (user.firstName && user.lastName && user.dateOfBirth) {
      return next(new AppError("Profile already completed", 400));
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.dateOfBirth = new Date(dateOfBirth);
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Profile completed successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    next(new AppError("Internal Server Error", 500));
  }
};

// Send verification email
export const sendVerification = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error } = validateSendVerification(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));

    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new AppError("User not found", 404));

    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    await user.save();

    await sendVerificationEmail(email, verificationCode);

    res.status(200).json({
      status: "success",
      message: "Verification email sent",
    });
  }
);

// Verify email
export const verifyEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error } = validateVerifyEmail(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));

    const { email, code } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new AppError("User not found", 404));

    if (user.verificationCode !== code)
      return next(new AppError("Invalid verification code", 400));

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Email verified successfully",
    });
  }
);

export const signIn = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate request body
    const { error } = validateSignIn(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));

    const { email, phone, password } = req.body;

    console.log("Sign-in request:", { email, phone, password });

    // Ensure we're only querying if values are provided
    const query: any = {};
    if (email) query.email = email;
    if (phone) query.phone = phone;

    console.log("Query being executed:", query);

    const user = await User.findOne(query).select("+password");

    console.log("User found:", user);

    if (!user) return next(new AppError("Invalid credentials", 401));

    // 🔹 Check if user has a password
    if (!user.password)
      return next(
        new AppError(
          "User does not have a password. Try logging in with Google or Facebook.",
          400
        )
      );

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new AppError("Invalid credentials", 401));

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });
    const newRefreshToken = generateRefreshToken(user._id.toString());

    // Store new refresh token in DB (invalidate old one)
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new refresh token in HTTP-only cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      status: "success",
      message: "Login successful",
      accessToken: token,
      // refreshToken: newRefreshToken,
      user: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  }
);

// Refresh Token Endpoint
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.cookies);

  const token = req.cookies?.refreshToken; // Read from HTTP-only cookie

  if (!token) return next(new AppError("Refresh token required", 401));

  // Validate refresh token
  let payload;
  try {
    payload = verifyRefreshToken(token) as { userId: string };
  } catch (err) {
    return next(new AppError("Invalid or expired refresh token", 401));
  }

  const user = await User.findById(payload.userId);
  if (!user || user.refreshToken !== token) {
    return next(new AppError("Invalid refresh token", 401));
  }

  // Generate new access & refresh tokens (ROTATION)
  const newAccessToken = generateToken(user._id.toString());
  const newRefreshToken = generateRefreshToken(user._id.toString());

  // Store new refresh token in DB (invalidate old one)
  user.refreshToken = newRefreshToken;
  await user.save();

  // Set new refresh token in HTTP-only cookie
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({ accessToken: newAccessToken });
};

// Switch to Hoster
export const switchToHoster = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id;

    // Ensure user is logged in
    if (!userId) {
      return next(new AppError("Unauthorized. Please log in", 401));
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Check if the user is already a hoster
    if (user.role === "hoster") {
      return next(new AppError("You are already a hoster", 400));
    }

    // Update role to "hoster"
    user.role = "hoster";
    await user.save();

    return res.json({
      status: "success",
      message: "You are now a hoster",
      user: { id: user._id, email: user.email, role: user.role },
    });
  }
);
