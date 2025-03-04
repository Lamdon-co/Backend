import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import { validateToggleNotification } from "../validators/userValidtor";

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
