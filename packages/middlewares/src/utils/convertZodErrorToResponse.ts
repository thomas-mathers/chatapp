import { ZodError, z } from 'zod';

export function convertZodErrorToResponse(error: ZodError) {
  const errorMessages = error.errors.map((issue: z.ZodIssue) => ({
    message: `${issue.path.join('.')}: ${issue.message}`,
  }));

  return errorMessages;
}
