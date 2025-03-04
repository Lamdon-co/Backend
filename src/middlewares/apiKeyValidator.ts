import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";
import { decrypt } from "../utils/encrypt";

export const authorizeUser = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-api-key"] as string;

  if (!apiKey) {
    return next(new AppError("Authorization failed: No API key provided", 401));
  }

  try {
    const decryptedKey = decrypt(apiKey);
    const decryptedStoredKey = decrypt(process.env.API_KEY_1 as string);

    if (!decryptedKey || !decryptedStoredKey || decryptedKey !== decryptedStoredKey) {
      return next(new AppError("Authorization failed: Invalid API key", 401));
    }

    next(); // Proceed to the next middleware or controller
  } catch (error) {
    console.error("Authorization Error:", error);
    return next(new AppError("Something went wrong while trying to authorize you", 401, error));
  }
};
