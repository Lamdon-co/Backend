import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import {
  kycSchema,
  profileUpdateSchema,
  validateToggleNotification,
} from "../validators/userValidtor";
import { uploadToCloudinary } from "../utils/cloudinary";
import KYC from "../models/kyc.model";

interface AuthRequest extends Request {
  user?: any;
}

// Toggle notifications
export const toggleNotifications = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
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
      message: `Notifications ${
        req.body.enable ? "enabled" : "disabled"
      } successfully`,
    });
  }
);

// 🔹 GET User Profile (Includes KYC Info)
export const getUserProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user?._id).populate("kyc"); // Fetch user with KYC details

    if (!user) return next(new AppError("User not found", 404));

    res.status(200).json({
      status: "success",
      user,
    });
  }
);

// 🔹 UPDATE User Profile
export const updateUserProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
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
  }
);

// 🔹 Submit KYC
export const submitKYC = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Validate request body
    console.log(req.files)

    const { error } = kycSchema.validate({...req.body, ...req.files});
    if (error) return next(new AppError(error.details[0].message, 400));

    const { idType } = req.body;

    // Ensure both images are uploaded
    if (!req.files || typeof req.files !== "object") {
      return next(new AppError("Images are required", 400));
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const frontImage = files["frontImage"]?.[0];
    const backImage = files["backImage"]?.[0];

    if (!frontImage || !backImage) {
      return next(new AppError("Both front and back images are required", 400));
    }

    // Upload to Cloudinary
    const frontImageUrl = await uploadToCloudinary(frontImage.path, "lamdon/v1/kycs");
    const backImageUrl = await uploadToCloudinary(backImage.path, "lamdon/v1/kycs");

    // Create KYC record
    const kyc = await KYC.create({
      user: req.user._id,
      idType,
      frontImage: frontImageUrl,

      backImage: backImageUrl,
    });

    // Update User with KYC reference
    await User.findByIdAndUpdate(req.user._id, { kyc: kyc._id });

    res.status(201).json({
      status: "success",
      message: "KYC submitted successfully",
      kyc,
    });
  }
);

// View KYC Submission
export const viewKyc = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user._id).select("kyc");
    if (!user || !user.kyc) {
      return next(new AppError("KYC not found", 404));
    }
    return res.json({ status: "success", kyc: user.kyc });
  }
);

// Approve/Reject KYC
export const updateKycStatus = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user._id).select("kyc");
    if (!user || !user.kyc) {
      return next(new AppError("KYC not found", 404));
    }
    return res.json({ status: "success", kyc: user.kyc });
  }
);
