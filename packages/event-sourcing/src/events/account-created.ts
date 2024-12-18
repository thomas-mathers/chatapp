import z from 'zod';

import { EventName } from '../event-name';

export const accountCreatedSchema = z.object({
  name: z.literal(EventName.ACCOUNT_CREATED),
  accountId: z.string(),
  accountName: z.string(),
  accountEmail: z.string(),
  token: z.string(),
  emailVerified: z.boolean(),
});

export type AccountCreated = z.infer<typeof accountCreatedSchema>;
