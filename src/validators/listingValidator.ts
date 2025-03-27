import Joi from "joi";
import mongoose from "mongoose";

export const addListingValidator = Joi.object({
  listingType: Joi.string().required(),

  placeType: Joi.string().required(),

  country: Joi.string().required(),
  state: Joi.string().required(),
  city: Joi.string().required(),
  street: Joi.string().required(),
  postcode: Joi.string().optional(),

  accommodation: Joi.object({
    guests: Joi.number().integer().min(1).required(),
    bedrooms: Joi.number().integer().min(1).required(),
    toilets: Joi.number().integer().min(1).required(),
  }).required(),

  features: Joi.array()
    .items(
      Joi.string().optional()
    )
    .default([]),

  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  price: Joi.number().positive().required(),
  listingId: Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.message({ custom: "Invalid Listing ID" });
    }
    return value;
  }),
});

export const listingUpdateSchema = addListingValidator.fork(
  [
    "listingType",
    "placeType",
    "country",
    "state",
    "city",
    "street",
    "postcode",
    "accommodation",
    "features",
    "title",
    "description",
    "price",
  ],
  (schema: { optional: () => any }) => schema.optional()
);
