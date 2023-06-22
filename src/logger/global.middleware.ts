import { Request, Response, NextFunction } from 'express';

export function globalMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  next();
}
