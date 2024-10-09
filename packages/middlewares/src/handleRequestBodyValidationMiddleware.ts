import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UnknownKeysParam, ZodRawShape, z } from 'zod';

import { convertZodErrorToResponse } from './utils/convertZodErrorToResponse';

export function handleRequestBodyValidationMiddleware(
  schema: z.ZodObject<ZodRawShape, UnknownKeysParam>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json(convertZodErrorToResponse(result.error));

      return;
    }

    next();
  };
}
