import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import passport from "passport";
import session from "express-session";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import mainRoutes from "./routes/main.routes";

import "./config/passport"; // Ensure passport config is loaded
import { NotFound } from "./controllers/main.controller";
import { errorHandler } from "./middlewares/errorHandler";


const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());

// Express session for OAuth
app.use(session({ secret: process.env.SESSION_SECRET!, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use(mainRoutes);
app.use("/v1/auth", authRoutes);
app.use("*", NotFound)

// Error Handling Middleware
app.use(errorHandler);

export default app;
