import Joi from "joi";
import mongoose from "mongoose";

// Booking Validation Schema
export const bookingSchema = Joi.object({
  listingId: Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.message({ custom: "Invalid Booking ID" });
    }
    return value;
  }),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  guests: Joi.number().min(1).required(),
});
