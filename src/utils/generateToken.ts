import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";
const JWT_EXPIRES_IN = "30d";
const JWT_REFRESH_EXPIRES_IN = "7d";

const generateToken = (id: mongoose.Types.ObjectId | string) => {
  return jwt.sign({ id: id.toString() }, JWT_SECRET!, { expiresIn: JWT_EXPIRES_IN });
};

// Generate Refresh Token
export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

// Verify Refresh Token
export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

export { generateToken };
