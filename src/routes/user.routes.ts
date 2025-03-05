import express from "express";
import {
  getUserProfile,
  submitKYC,
  toggleNotifications,
  updateUserProfile,
} from "../controllers/user.controller";
import authMiddleware from "../middlewares/auth.middleware";
import upload from "../middlewares/upload";

const router = express.Router();

router.post("/toggle-notifications", authMiddleware, toggleNotifications);
router.get("/profile", authMiddleware, getUserProfile);
router.patch("/profile", authMiddleware, updateUserProfile);
router.post(
  "/kyc/submit",
  authMiddleware,
  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 },
  ]),
  submitKYC
);

export default router;
