import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface JwtOptions {
  issuer: string;
  audience: string;
  maxAgeInSeconds: number;
  secret: string;
}

export const handleAuthMiddleware =
  ({ issuer, audience, maxAgeInSeconds: maxAge, secret }: JwtOptions) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const authorizationSegments = req.headers.authorization?.split(" ") ?? [];

    if (
      authorizationSegments.length !== 2 ||
      authorizationSegments[0] !== "Bearer"
    ) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const token = authorizationSegments[1];

    try {
      const options: jwt.VerifyOptions = { issuer, audience, maxAge };

      const { sub, username } = jwt.verify(token, secret, options) as {
        sub: string | undefined;
        username: string | undefined;
      };

      if (sub === undefined || username === undefined) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      req.accountId = sub;
      req.accountUsername = username;

      next();
    } catch {
      res.status(401).json({ message: "Unauthorized" });
    }
  };
