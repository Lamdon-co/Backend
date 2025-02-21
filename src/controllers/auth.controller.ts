import { NextFunction, Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";
import { completeSignupSchema } from "../validators/authValidator";
import { AppError } from "../middlewares/errorHandler";
import User from "../models/user.model";

export const signUp = async (req: Request, res: Response) => {
  try {
    const { email, phone, password, authProvider, providerId } = req.body;
    const { user, token } = await registerUser(email, phone, password, authProvider, providerId);
    
    res.status(201).json({ status: "success", user, token });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const completeSignup = async (req: Request, res: Response, next: NextFunction) => {
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

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser(email, password);
    
    res.status(200).json({ status: "success", user, token });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
