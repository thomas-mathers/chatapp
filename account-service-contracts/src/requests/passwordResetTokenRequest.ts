import { z } from "zod";

export const passwordResetTokenRequestSchema = z.object({
  email: z.string().min(1).email(),
});

export type PasswordResetTokenRequest = z.infer<
  typeof passwordResetTokenRequestSchema
>;
