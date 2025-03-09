import Joi from "joi";
import mongoose from "mongoose";

export const addListingValidator = Joi.object({
  listingType: Joi.string()
    .valid(
      "House",
      "Flat/Apartment",
      "Semi detached bungalow",
      "Semi detached duplex",
      "Studio",
      "Single room"
    )
    .required(),

  placeType: Joi.string()
    .valid("entire place", "shared room", "a room")
    .required(),

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
      Joi.string().valid(
        "wifi",
        "tv",
        "kitchen",
        "washing machine",
        "free parking",
        "paid parking",
        "Air conditioning",
        "dedicated workspace",
        "pool",
        "hot tub",
        "pool table",
        "exercise equipment",
        "smoke alarm",
        "first aid kit",
        "fire extinguisher",
        "carbon monoxide alarm"
      )
    )
    .default([]),

  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  price: Joi.number().positive().required(),
  photos: Joi.required(),
  coverPhoto: Joi.required(),
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
    "photos",
    "coverPhoto",
    "price",
  ],
  (schema: { optional: () => any }) => schema.optional()
);
