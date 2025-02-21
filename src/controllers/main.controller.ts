import { Request, Response } from "express";

export const Home = async (req: Request, res: Response) => {
  try {
    res.status(200).json({ status: "success", message: "Lamdon API is up and running" });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const NotFound = async (req: Request, res: Response) => {
  try {
    res.status(404).json({ status: "success", message: "Oops!, Seems you lost your way, Find your way back home" });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
