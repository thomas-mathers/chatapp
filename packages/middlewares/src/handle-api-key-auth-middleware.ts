import { NextFunction, Request, Response } from 'express';

export const handleApiKeyAuthMiddleware =
  (expectedApiKey: string) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const actualApiKey = req.headers['x-api-key'];

    if (actualApiKey !== expectedApiKey) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    next();
  };
