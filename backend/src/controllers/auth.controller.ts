import { Request, Response } from 'express';

export function getMe(req: Request, res: Response): void {
  // requireAuth guarantees req.user is set before this handler runs.
  res.status(200).json({ user: req.user });
}
