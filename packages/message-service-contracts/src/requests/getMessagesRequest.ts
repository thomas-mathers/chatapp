import { z } from 'zod';

import { MessageSummary } from '../responses/messageSummary';
import { SortDirection } from '../sortDirection';

type MessageSummaryKeys = keyof MessageSummary;

const sortColumns: MessageSummaryKeys[] = [
  'id',
  'accountId',
  'accountUsername',
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
