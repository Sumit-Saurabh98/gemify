import { Request, Response, NextFunction } from 'express';
import { ValidationError, RateLimitError, AIServiceError } from '../utils/validation';

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error for debugging
  console.error('🔥 Error occurred:', {
    name: err.name,
    message: err.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Log stack trace in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack trace:', err.stack);
  }

  // Handle specific error types
  if (err instanceof ValidationError) {
    res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: err.message,
      field: err.field,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (err instanceof RateLimitError) {
    res.status(429).json({
      success: false,
      error: 'Rate Limit Exceeded',
      message: err.message,
      resetIn: err.resetIn,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (err instanceof AIServiceError) {
    res.status(err.statusCode).json({
      success: false,
      error: 'AI Service Error',
      message: err.message,
      code: err.code,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (err instanceof APIError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.name,
      message: err.message,
      code: err.code,
      details: err.details,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle mongoose/database errors
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: 'Invalid ID',
      message: 'The provided ID is not valid',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      error: 'Invalid JSON',
      message: 'Request body contains invalid JSON',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Default error response
  const statusCode = 'statusCode' in err && typeof err.statusCode === 'number' 
    ? err.statusCode 
    : 500;

  res.status(statusCode).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found error handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Request logger middleware
 */
export const requestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const timestamp = new Date().toISOString();
  console.log(`📥 ${req.method} ${req.path} - ${timestamp}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  
  next();
};

export default {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  requestLogger,
  APIError,
};
