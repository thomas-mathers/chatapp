import { z } from 'zod';

export const accountRegistrationRequest = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  email: z.string().email(),
});

export type AccountRegistrationRequest = z.infer<
  typeof accountRegistrationRequest
>;
