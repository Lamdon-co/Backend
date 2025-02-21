import express from "express";
import "../config/passport"; // Import passport configurations
import { Home } from "../controllers/main.controller";

const router = express.Router();

// Email & Password Authentication
router.post("/", Home);

export default router;
