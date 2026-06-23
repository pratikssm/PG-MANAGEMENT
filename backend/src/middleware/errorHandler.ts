import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/ApiResponse';
import { env } from '../config/env';

export function notFound(_req: Request, res: Response, next: NextFunction) {
  next(new AppError(`Route not found`, 404));
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e: any) => e.message).join(', ');
  }
  if (err.code === 11000) {
    statusCode = 409;
    message = `Duplicate value for: ${Object.keys(err.keyValue).join(', ')}`;
  }
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: env.isProd ? undefined : err.stack,
  });
}
