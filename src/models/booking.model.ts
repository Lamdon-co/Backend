import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    guests: { type: Number, required: true },
    priceDetails: {
      listingPrice: { type: Number, required: true },
      days: { type: Number, required: true },
      cleaningFee: { type: Number, required: true },
      lamdonFee: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
    },
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
    paymentReference: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", BookingSchema);
