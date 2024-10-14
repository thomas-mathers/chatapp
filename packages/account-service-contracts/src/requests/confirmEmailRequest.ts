import { z } from 'zod';

export const confirmEmailRequestSchema = z.object({
  token: z.string(),
});

export type ConfirmEmailRequest = z.infer<typeof confirmEmailRequestSchema>;
