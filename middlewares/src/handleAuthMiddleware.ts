import { NextFunction, Request, Response } from "express";
import { JwtOptions, verifyJwt } from "chatapp.crypto";

export const handleAuthMiddleware =
  (options: JwtOptions) =>
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
      const userCredentials = verifyJwt(token, options);

      if (userCredentials === undefined) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      req.accountId = userCredentials.userId;
      req.accountUsername = userCredentials.username;

      next();
    } catch {
      res.status(401).json({ message: "Unauthorized" });
    }
  };
