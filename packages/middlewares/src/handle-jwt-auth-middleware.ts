import { JwtOptions, verifyJwt } from 'chatapp.crypto';
import { NextFunction, Request, Response } from 'express';

export const handleJwtAuthMiddleware =
  (options: JwtOptions) =>
  (req: Request, res: Response, next: NextFunction): void => {
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
      const userCredentials = verifyJwt(token, options);

      if (userCredentials === undefined) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      req.accountId = userCredentials.userId;
      req.token = token;

      next();
    } catch {
      res.status(401).json({ message: 'Unauthorized' });
    }
  };
