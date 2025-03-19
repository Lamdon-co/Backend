import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import Booking from "../models/booking.model";
import Listing from "../models/listing.model";
import dotenv from "dotenv";
import { AppError } from "../middlewares/errorHandler";
import { asyncHandler } from "../middlewares/asyncHandler";
import axios from "axios";
import { bookingSchema } from "../validators/bookingValidator";
import User from "../models/user.model";

dotenv.config();

const paystackSecret = process.env.PAYSTACK_SECRET_KEY || "";

// Function to calculate days
const calculateDays = (startDate: Date, endDate: Date): number => {
  return Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );
};

interface AuthRequest extends Request {
  user?: any;
}

// Book Reservation
export const bookListing = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { error } = bookingSchema.validate(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));

    const { listingId, startDate, endDate, guests } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return next(new AppError("Listing not found", 404));

    if (listing.status !== "active")
      return next(new AppError("Listing is not available", 400));

    const days = calculateDays(startDate, endDate);
    if (days < 1)
      return next(new AppError("End date must be after start date", 400));

    const listingPrice = listing.price * days;
    const cleaningFee = 50; // Example cleaning fee
    const lamdonFee = (listingPrice * 2) / 100;
    const totalPrice = listingPrice + cleaningFee + lamdonFee;

    const newBooking = new Booking({
      listing: listingId,
      user: req.user._id,
      startDate,
      endDate,
      guests,
      priceDetails: { listingPrice, days, cleaningFee, lamdonFee, totalPrice },
      paymentStatus: "pending",
    });

    await newBooking.save();

    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Generate Paystack Payment Link
    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: totalPrice * 100, // Convert to kobo
        reference: `LAMDON-${Date.now()}`,
        callback_url: `${process.env.BASE_URL}/v1/booking/verify-payment`,
        metadata: { bookingId: newBooking._id },
      },
      { headers: { Authorization: `Bearer ${paystackSecret}` } }
    );

    newBooking.paymentReference = paystackResponse.data.data.reference;
    await newBooking.save();

    res.json({
      status: "success",
      message: "Booking initiated. Complete payment to confirm reservation.",
      paymentLink: paystackResponse.data.data.authorization_url,
    });
  }
);

export const verifyPayment = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { reference } = req.query;

    if (!reference)
      return next(new AppError("Payment reference is required", 400));

    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${paystackSecret}` },
      }
    );

    if (paystackResponse.data.data.status !== "success") {
      return next(new AppError("Payment verification failed", 400));
    }

    const booking = await Booking.findOne({ paymentReference: reference });
    if (!booking) return next(new AppError("Booking not found", 404));

    booking.paymentStatus = "paid";
    await booking.save();

    res.json({ status: "success", message: "Payment verified successfully!" });
  }
);
