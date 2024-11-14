import { z } from 'zod';

export const emailMessageSchema = z.object({
  from: z.string().email(),
  to: z.string().email(),
  subject: z.string(),
  text: z.string(),
  html: z.string(),
});

export type EmailMessage = z.infer<typeof emailMessageSchema>;
