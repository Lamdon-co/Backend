import mongoose from "mongoose";

interface IKYC extends mongoose.Document {
  user: mongoose.Schema.Types.ObjectId;
  idType: "Driving License" | "Passport" | "Identity Card";
  frontImage: string;
  backImage: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

const KYCSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    idType: {
      type: String,
      enum: ["Driving License", "Passport", "Identity Card"],
      required: true,
    },
    frontImage: { type: String, required: true },
    backImage: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

const KYC = mongoose.model<IKYC>("KYC", KYCSchema);
export default KYC;
