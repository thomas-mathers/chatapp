import { ErrorCode, badRequest } from 'chatapp.api-result';
import { NextFunction, Request, Response } from 'express';
import { UnknownKeysParam, ZodRawShape, z } from 'zod';

import { convertZodErrorToResponse } from './utils/convertZodErrorToResponse';

export function handleRequestBodyValidationMiddleware(
  schema: z.ZodObject<ZodRawShape, UnknownKeysParam>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const badRequestResult = badRequest(
        ErrorCode.InvalidRequest,
        convertZodErrorToResponse(result.error),
      );

      res.status(badRequestResult.statusCode).json(badRequestResult);

      return;
    }

    next();
  };
}
