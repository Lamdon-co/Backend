import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { AppError } from "./errorHandler";

const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorDetails = error.details.map((err) => err.message);
      return next(new AppError("Validation error", 400, { errors: errorDetails }));
    }
    next();
  };
};

export default validateRequest;
