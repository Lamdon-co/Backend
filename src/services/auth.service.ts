import bcrypt from "bcryptjs";
import User from "../models/user.model";
import { generateToken } from "../utils/generateToken";
import { AppError } from "../middlewares/errorHandler";

export const registerUser = async (
  email: string,
  phone: string,
  password: string,
  authProvider: string,
  providerId?: string
) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

  const user = await User.create({
    email,
    phone,
    password: hashedPassword,
    authProvider,
    providerId,
  });

  return { user, token: generateToken(user._id.toString()) };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password!))) {
    throw new AppError("Invalid credentials", 401);
  }

  return { user, token: generateToken(user._id) };
};
