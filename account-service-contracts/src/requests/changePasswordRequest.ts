import { z } from "zod";

export const changePasswordRequestSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(1),
});

export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;
