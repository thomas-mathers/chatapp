import z from 'zod';

import { EventName } from '../event-name';

export const requestResetPasswordSchema = z.object({
  name: z.literal(EventName.REQUEST_RESET_PASSWORD),
  accountId: z.string(),
  accountName: z.string(),
  accountEmail: z.string(),
  token: z.string(),
});

export type RequestResetPassword = z.infer<typeof requestResetPasswordSchema>;
