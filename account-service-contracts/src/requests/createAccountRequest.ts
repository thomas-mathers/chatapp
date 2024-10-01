import { z } from "zod";

export const createAccountRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type CreateAccountRequest = z.infer<typeof createAccountRequestSchema>;
