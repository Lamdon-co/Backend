import Joi from "joi";
import mongoose from "mongoose";

export const signupSchema = Joi.object({
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^[0-9]+$/),
  password: Joi.string().min(6).required(),
  authProvider: Joi.string()
    .valid("email", "google", "facebook", "apple")
    .required(),
  providerId: Joi.string().optional(),
}).or("email", "phone"); // ✅ At least one of email or phone must be provided

export const completeSignupSchema = Joi.object({
  userId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message({ custom: "Invalid User ID" });
      }
      return value;
    })
    .required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  dateOfBirth: Joi.date().iso().required(), // Must be a valid date
});
