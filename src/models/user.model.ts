import mongoose from "mongoose";

interface INotification {
  type: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface IUser extends Document {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  authProvider: string;
  isVerified: boolean;
  verificationCode?: string;
  notifications: INotification[];
  notificationsEnabled: boolean;
}

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, select: false }, // Only stored for email/phone users
    firstName: { type: String },
    lastName: { type: String },
    dateOfBirth: { type: Date },
    authProvider: {
      type: String,
      enum: ["email", "phone", "google", "facebook", "apple"],
      required: true,
    },
    providerId: { type: String, unique: true, sparse: true }, // For OAuth users
    verificationCode: { type: String },
    isVerified: { type: Boolean, default: false },
    notifications: [
      {
        type: { type: String, required: true },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    notificationsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
