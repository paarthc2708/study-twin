import { NextFunction, Request, Response } from 'express';
import { config } from '../config/env';
import { AppError } from '../utils/AppError';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = isAppError || !config.isProduction ? err.message : 'Internal server error';

  if (!isAppError || statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error(`[error] ${req.method} ${req.originalUrl} ->`, err);
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(config.isProduction ? {} : { stack: err.stack }),
  });
}
