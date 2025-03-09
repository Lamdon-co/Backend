import mongoose, { Schema, Document } from "mongoose";

interface IListing extends Document {
  postedBy: mongoose.Schema.Types.ObjectId;
  listingType: string;
  placeType: string;
  status: string;
  address: {
    country: string;
    state: string;
    city: string;
    street: string;
    postcode?: string;
  };
  accommodation: {
    guests: number;
    bedrooms: number;
    toilets: number;
  };
  features: string[];
  title: string;
  description: string;
  photos: string[];
  coverPhoto: string;
  price: number;
}

const ListingSchema = new Schema<IListing>(
  {
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listingType: {
      type: String,
      enum: [
        "House",
        "Flat/Apartment",
        "Semi detached bungalow",
        "Semi detached duplex",
        "Studio",
        "Single room",
      ],
      required: true,
    },
    placeType: {
      type: String,
      enum: ["entire place", "shared room", "a room"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
    },
    address: {
      country: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      street: { type: String, required: true },
      postcode: { type: String },
    },
    accommodation: {
      guests: { type: Number, required: true, min: 1 },
      bedrooms: { type: Number, required: true, min: 1 },
      toilets: { type: Number, required: true, min: 1 },
    },
    features: [{ type: String }],
    title: { type: String, required: true, minlength: 5, maxlength: 100 },
    description: { type: String, required: true, minlength: 10, maxlength: 1000 },
    photos: [{ type: String, required: true }],
    coverPhoto: { type: String, required: true },
    price: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

export default mongoose.model<IListing>("Listing", ListingSchema);
