import express from "express";
import { toggleNotifications } from "../controllers/user.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/toggle-notifications", authMiddleware, toggleNotifications);

export default router;
