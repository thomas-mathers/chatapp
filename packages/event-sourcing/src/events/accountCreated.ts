import z from 'zod';

import { EventName } from '../eventName';

export const accountCreatedSchema = z.object({
  name: z.literal(EventName.ACCOUNT_CREATED),
  accountId: z.string(),
  accountName: z.string(),
  accountEmail: z.string(),
  token: z.string(),
});

export type AccountCreated = z.infer<typeof accountCreatedSchema>;
