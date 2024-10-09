import z from 'zod';

import { ChatAppEventName } from '../chatAppEventName';

export const accountCreatedSchema = z.object({
  name: z.literal(ChatAppEventName.ACCOUNT_CREATED),
  accountId: z.string(),
  accountName: z.string(),
  accountEmail: z.string(),
});

export type AccountCreated = z.infer<typeof accountCreatedSchema>;
