import { z } from 'zod';

import { AccountSummary } from '../responses/account-summary';
import { SortDirection } from '../sort-direction';

type AccountSummaryKeys = keyof AccountSummary;

const sortColumns: AccountSummaryKeys[] = ['username', 'email', 'dateCreated'];

const [firstSortColumn, ...restSortColumns] = sortColumns;

export const getAccountsRequestSchema = z.object({
  accountIds: z
    .string()
    .transform((value) => value.split(','))
    .optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(1000).default(10).optional(),
  sortBy: z.enum([firstSortColumn, ...restSortColumns]).optional(),
  sortDirection: z.nativeEnum(SortDirection).optional(),
});

export type GetAccountsRequest = z.infer<typeof getAccountsRequestSchema>;
