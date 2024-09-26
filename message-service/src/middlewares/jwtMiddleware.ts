import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export default function jwtMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorizationParts = req.headers.authorization?.split(' ') ?? [];
  if (authorizationParts.length !== 2 || authorizationParts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authorizationParts[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.accountId = decoded.sub as string;
    next();
  } catch (e) {
    console.log('Invalid token', e);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
