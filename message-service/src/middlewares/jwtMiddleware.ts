import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../env';

export default function jwtMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authorizationParts = req.headers.authorization?.split(' ') ?? [];
  if (authorizationParts.length !== 2 || authorizationParts[0] !== 'Bearer') {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const token = authorizationParts[1];
  try {
    const options = {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      maxAge: env.JWT_EXPIRATION_TIME_IN_SECONDS,
    };
    const decoded = jwt.verify(token, env.JWT_SECRET, options);
    req.accountId = decoded.sub as string;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
}
