import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateToken = (id: mongoose.Types.ObjectId | string) => {
  return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET!, { expiresIn: "30d" });
};

export { generateToken };
