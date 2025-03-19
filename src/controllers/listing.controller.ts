import { Request, Response, NextFunction } from "express";
import Listing from "../models/listing.model";
import User from "../models/user.model";
import { AppError } from "../middlewares/errorHandler";
import {
  addListingValidator,
  listingUpdateSchema,
} from "../validators/listingValidator";
import { uploadToCloudinary } from "../utils/cloudinary";
import { asyncHandler } from "../middlewares/asyncHandler";

interface AuthRequest extends Request {
  user?: any;
}

// Fetch All Active Listings
export const getAllListings = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const listings = await Listing.find({ status: "active" }).populate(
      "postedBy",
      "name email"
    );

    res.json({
      status: "success",
      count: listings.length,
      listings,
    });
  }
);

// Search Listings
export const searchListings = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { keyword, location, minPrice, maxPrice, type, guests } = req.query;

    const filters: any = { status: "active" };

    if (keyword) {
      filters.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    if (location) {
      filters["address.city"] = { $regex: location, $options: "i" };
    }

    if (type) {
      filters.listingType = type;
    }

    if (guests) {
      filters["accommodation.guests"] = { $gte: Number(guests) };
    }

    if (minPrice) {
      filters.price = { ...filters.price, $gte: Number(minPrice) };
    }

    if (maxPrice) {
      filters.price = { ...filters.price, $lte: Number(maxPrice) };
    }

    const listings = await Listing.find(filters).populate(
      "postedBy",
      "name email"
    );

    res.json({
      status: "success",
      count: listings.length,
      listings,
    });
  }
);

export const getListingById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const listing = await Listing.findOne({ _id: id, status: "active" })
      .populate("postedBy", "name email firstName")
      .exec();

    if (!listing) {
      return next(
        new AppError("Listing not found or has been deactivated", 404)
      );
    }

    res.json({
      status: "success",
      listing,
    });
  }
);

// Add New Listing
export const addListing = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Get user details
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Ensure user is a "hoster"
    if (user.role !== "hoster") {
      return next(new AppError("Only hosters can create listings", 403));
    }

    // Validate request body
    const { error, value } = addListingValidator.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return next(new AppError("Validation error", 400, error.details));
    }

    if (!req.files || typeof req.files !== "object") {
      return next(
        new AppError("At least 5 images (4 photos + 1 cover) are required", 400)
      );
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const photos = files["photos"];
    const coverPhoto = files["coverPhoto"]?.[0];

    if (!photos || photos.length < 4 || !coverPhoto) {
      return next(
        new AppError("At least 4 photos and 1 cover photo are required", 400)
      );
    }

    // Upload Images to Cloudinary
    const photoUrls = await Promise.all(
      photos.map((photo) =>
        uploadToCloudinary(photo.path, "lamdon/v1/listings")
      )
    );
    const coverPhotoUrl = await uploadToCloudinary(
      coverPhoto.path,
      "lamdon/v1/listings"
    );

    // Create Listing
    const listing = await Listing.create({
      postedBy: req.user._id,
      listingType: value.listingType,
      placeType: value.placeType,
      address: {
        country: value.country,
        state: value.state,
        city: value.city,
        street: value.street,
        postcode: value.postcode || null,
      },
      accommodation: value.accommodation,
      features: value.features,
      title: value.title,
      description: value.description,
      photos: photoUrls,
      coverPhoto: coverPhotoUrl,
      price: value.price,
    });

    return res.status(201).json({
      status: "success",
      message: "Listing added successfully",
      listing,
    });
  }
);

export const updateListing = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { listingId } = req.params;
    const validation = listingUpdateSchema.validate({ ...req.body, listingId });
    if (validation.error) {
      return next(new AppError(validation.error.details[0].message, 400));
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return next(new AppError("Listing not found", 404));
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (
      user.role !== "hoster" ||
      listing.postedBy.toString() !== req.user._id
    ) {
      return next(
        new AppError("You are not authorized to update this listing", 403)
      );
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      listingId,
      req.body,
      { new: true }
    );
    res.json({
      status: "success",
      message: "Listing updated successfully",
      listing: updatedListing,
    });
  }
);

// Admin Deactivate Listing
export const deactivateListing = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { listingId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return next(new AppError("Listing not found", 404));
    }

    if (
      user.role !== "hoster" ||
      listing.postedBy.toString() !== req.user._id
    ) {
      return next(
        new AppError("You are not authorized to update this listing", 403)
      );
    }

    const deactivatedListing = await Listing.findByIdAndUpdate(
      listingId,
      { status: "inactive" },
      { new: true }
    );
    if (!deactivatedListing) {
      return next(new AppError("Listing not found", 404));
    }

    res.json({
      status: "success",
      message: "Listing deactivated successfully",
      listing,
    });
  }
);

// Admin Delete Listing
export const deleteListing = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { listingId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    if (user.role !== "admin") {
      return next(new AppError("Unauthorized", 403));
    }

    const listing = await Listing.findByIdAndDelete(listingId);
    if (!listing) {
      return next(new AppError("Listing not found", 404));
    }

    res.json({ status: "success", message: "Listing deleted successfully" });
  }
);
