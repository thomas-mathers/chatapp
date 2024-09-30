import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import env from '../env';

export default function handleAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authorizationSegments = req.headers.authorization?.split(' ') ?? [];

  if (
    authorizationSegments.length !== 2 ||
    authorizationSegments[0] !== 'Bearer'
  ) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = authorizationSegments[1];

  try {
    const options: jwt.VerifyOptions = {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      maxAge: env.JWT_EXPIRATION_TIME_IN_SECONDS,
    };

    const { sub, username } = jwt.verify(token, env.JWT_SECRET, options) as {
      sub: string | undefined;
      username: string | undefined;
    };

    if (sub === undefined || username === undefined) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    req.accountId = sub;
    req.accountUsername = username;

    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
}
