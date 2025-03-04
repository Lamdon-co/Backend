import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { AppError } from "./errorHandler";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return next(new AppError("Access Denied. No token provided.", 401));

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    if (!decoded.id) return next(new AppError("Invalid token", 401));

    const user = await User.findById(decoded.id).select("-password"); // Exclude password field
    if (!user) return next(new AppError("User not found", 404));

    req.user = { _id: user._id.toString() }; // Attach user info to request
    next();
  } catch (error) {
    next(new AppError("Invalid or expired token", 401));
  }
};

export default authMiddleware;
