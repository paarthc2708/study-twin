import { Request, Response } from 'express';

const startedAt = Date.now();

export function getHealth(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'ok',
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  });
}

export function getLiveness(_req: Request, res: Response): void {
  // Liveness: process is up and able to handle requests.
  res.status(200).json({ status: 'ok' });
}

export function getReadiness(_req: Request, res: Response): void {
  // Readiness: process is ready to accept traffic. Extend this with real
  // dependency checks (database, cache, etc.) once the app has any.
  res.status(200).json({ status: 'ok' });
}
