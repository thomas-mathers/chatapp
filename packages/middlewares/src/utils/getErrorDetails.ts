import { ZodError } from 'zod';

export function getErrorDetails(error: ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};

  error.errors.forEach((error) => {
    const { path: pathSegments, message } = error;

    const path = pathSegments.map((t) => t.toString()).join('.');

    if (details[path]) {
      details[path].push(message);
    } else {
      details[path] = [message];
    }
  });

  return details;
}
