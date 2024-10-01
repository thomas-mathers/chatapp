import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UnknownKeysParam, ZodError, ZodRawShape, z } from "zod";

export function handleRequestValidationMiddleware(
  schema: z.ZodObject<ZodRawShape, UnknownKeysParam>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json(convertZodErrorToResponse(error));

        return;
      }

      throw error;
    }
  };
}

function convertZodErrorToResponse(error: ZodError) {
  const errorMessages = error.errors.map((issue: z.ZodIssue) => ({
    message: `${issue.path.join(".")} is ${issue.message}`,
  }));

  return { error: "Invalid data", details: errorMessages };
}
