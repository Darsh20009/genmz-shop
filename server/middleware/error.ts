import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export class ApiError extends Error {
  constructor(public statusCode: number, message: string, public details?: any) {
    super(message);
    this.name = "ApiError";
  }
}

export const errorMiddleware = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const timestamp = new Date().toISOString();
  console.error(`[API ERROR] [${timestamp}] ${err.name}: ${err.message}`, err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.name,
      timestamp,
      details: err.details,
    });
  }

  if (err instanceof ZodError) {
    const validationError = fromZodError(err);
    return res.status(400).json({
      success: false,
      message: "خطأ في التحقق من البيانات",
      errorCode: "VALIDATION_ERROR",
      timestamp,
      details: validationError.message,
    });
  }

  // Handle specific database errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      success: false,
      message: "خطأ في قاعدة البيانات",
      errorCode: "DATABASE_ERROR",
      timestamp,
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "حدث خطأ داخلي في الخادم",
    errorCode: "INTERNAL_SERVER_ERROR",
    timestamp,
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export const wrapHandler = (fn: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
