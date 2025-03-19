import express from "express";
import { bookListing, verifyPayment } from "../controllers/booking.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/initiate", authMiddleware, bookListing);
router.get("/verify-payment", authMiddleware, verifyPayment);

export default router;
