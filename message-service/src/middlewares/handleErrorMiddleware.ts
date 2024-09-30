import { NextFunction, Request, Response } from 'express';

export function handleErrorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(err);
  res.status(500).send('Internal server error');
  next(err);
}
