import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import { profileUpdateSchema, validateToggleNotification } from "../validators/userValidtor";

interface AuthRequest extends Request {
  user?: any;
}

// Toggle notifications
export const toggleNotifications = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { error } = validateToggleNotification(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const userId = req.user?._id; // Use _id instead of id
  if (!userId) return next(new AppError("Unauthorized", 401));

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  user.notificationsEnabled = req.body.enable;
  await user.save();

  res.status(200).json({
    status: "success",
    message: `Notifications ${req.body.enable ? "enabled" : "disabled"} successfully`,
  });
});

// 🔹 GET User Profile (Includes KYC Info)
export const getUserProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user?._id).populate("kyc"); // Fetch user with KYC details

  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({
    status: "success",
    user,
  });
});

// 🔹 UPDATE User Profile
export const updateUserProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Validate request body
  const { error } = profileUpdateSchema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: req.body }, // Update provided fields
    { new: true, runValidators: true }
  ).populate("kyc"); // Fetch updated user with KYC details

  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    user,
  });
});

