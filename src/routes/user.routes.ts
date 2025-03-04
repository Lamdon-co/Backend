import express from "express";
import { getUserProfile, toggleNotifications, updateUserProfile } from "../controllers/user.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/toggle-notifications", authMiddleware, toggleNotifications);
router.get("/profile", authMiddleware, getUserProfile);
router.patch("/profile", authMiddleware, updateUserProfile);

export default router;
