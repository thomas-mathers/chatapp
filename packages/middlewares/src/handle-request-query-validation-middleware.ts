import { ApiError } from 'chatapp.api-error';
import { ApiErrorCode } from 'chatapp.api-error';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UnknownKeysParam, ZodRawShape, z } from 'zod';

import { getErrorDetails } from './utils/get-error-details';

export function handleRequestQueryValidationMiddleware(
  schema: z.ZodObject<ZodRawShape, UnknownKeysParam>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const error = ApiError.fromErrorCode({
        code: ApiErrorCode.InvalidRequest,
        details: getErrorDetails(result.error),
      });

      res.status(StatusCodes.BAD_REQUEST).json(error);

      return;
    }

    next();
  };
}
