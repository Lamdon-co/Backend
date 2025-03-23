import mongoose, { Schema, Document } from "mongoose";

interface INotification {
  type: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

interface IEmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  authProvider: string;
  role: string;
  isVerified: boolean;
  verificationCode?: string;
  notifications: INotification[];
  notificationsEnabled: boolean;
  address?: string;
  emergencyContact?: IEmergencyContact;
  refreshToken: string,
  kyc?: mongoose.Types.ObjectId; // 🔹 Reference to the KYC model
}

const UserSchema = new Schema(
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
    role: {
      type: String,
      enum: ["user", "hoster", "admin"],
      default: "user",
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

    // 🔹 New Fields
    address: { type: String }, // Physical address
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String },
    },
    refreshToken: { type: String },
    kyc: { type: Schema.Types.ObjectId, ref: "KYC" }, // 🔹 References KYC Model
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
