import { z } from 'zod';

import { MessageSummary } from '../responses/message-summary';
import { SortDirection } from '../sort-direction';

type MessageSummaryKeys = keyof MessageSummary;

const sortColumns: MessageSummaryKeys[] = [
  'accountId',
  'username',
  'content',
  'dateCreated',
];

const [firstSortColumn, ...restSortColumns] = sortColumns;

export const getMessagesRequestSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(1000).default(10).optional(),
  sortBy: z.enum([firstSortColumn, ...restSortColumns]).optional(),
  sortDirection: z.nativeEnum(SortDirection).optional(),
});

export type GetMessagesRequest = z.infer<typeof getMessagesRequestSchema>;
