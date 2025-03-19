import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import passport from "passport";
import session from "express-session";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import listingRoutes from "./routes/listing.routes";
import bookingRoutes from "./routes/booking.routes";

import "./config/passport"; // Ensure passport config is loaded
import { NotFound } from "./controllers/main.controller";
import { errorHandler } from "./middlewares/errorHandler";
// import { encrypt } from "./utils/encrypt";
import { authorizeUser } from "./middlewares/apiKeyValidator";
import { cloudinaryConfig } from "./config/cloudinary";

// console.log(encrypt(""))

cloudinaryConfig()

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());

// Express session for OAuth
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ status: "success", message: "Lamdon API is up and running" });
});
app.use("/v1/auth", authorizeUser, authRoutes);
app.use("/v1/account", authorizeUser, userRoutes);
app.use("/v1/listing", authorizeUser, listingRoutes);
app.use("/v1/booking", authorizeUser, bookingRoutes);
app.use("*", NotFound);

// Error Handling Middleware
app.use(errorHandler);

export default app;
