import { Request, Response, NextFunction } from "express";

// Custom Error Class
class AppError extends Error {
  public statusCode: number;
  public data?: any;

  constructor(message: string, statusCode: number = 500, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Express Error Handling Middleware
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[ERROR] ${statusCode} - ${message}`);

  res.status(statusCode).json({
    status: "error",
    message,
    ...(err.data && { data: err.data }), // Include extra error data if available
  });
};

export { AppError, errorHandler };
