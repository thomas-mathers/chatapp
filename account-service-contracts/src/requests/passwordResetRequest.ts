import { z } from "zod";

export const passwordResetRequestSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(1),
});

export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
