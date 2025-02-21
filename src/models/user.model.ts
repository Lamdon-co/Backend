import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, select: false }, // Only stored for email/phone users
    firstName: { type: String },
    lastName: { type: String },
    dateOfBirth: { type: Date },
    authProvider: { type: String, enum: ["email", "phone", "google", "facebook", "apple"], required: true },
    providerId: { type: String, unique: true, sparse: true }, // For OAuth users
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
