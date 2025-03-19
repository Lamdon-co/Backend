import express from "express";
import authMiddleware from "../middlewares/auth.middleware";
import upload from "../middlewares/upload";
import { addListing, deactivateListing, deleteListing, getAllListings, getListingById, searchListings, updateListing } from "../controllers/listing.controller";

const router = express.Router();

router.get("/all", authMiddleware, getAllListings);
router.get("/search", authMiddleware, searchListings);
router.get("/:id", authMiddleware, getListingById);
router.post(
  "/add",
  authMiddleware,
  upload.fields([
    { name: "photos", maxCount: 10 },
    { name: "coverPhoto", maxCount: 1 },
  ]),
  addListing
);
router.put("/update/:listingId", authMiddleware, updateListing);
router.patch("/deactivate/:listingId", authMiddleware, deactivateListing) ;
router.delete("/delete/:listingId", authMiddleware, deleteListing)

export default router;
