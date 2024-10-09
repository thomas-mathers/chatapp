import z from 'zod';

import { ChatAppEventName } from '../chatAppEventName';

export const requestResetPasswordSchema = z.object({
  name: z.literal(ChatAppEventName.REQUEST_RESET_PASSWORD),
  accountId: z.string(),
  accountName: z.string(),
  accountEmail: z.string(),
  token: z.string(),
});

export type RequestResetPassword = z.infer<typeof requestResetPasswordSchema>;
