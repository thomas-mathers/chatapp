import { z } from "zod";
import { AccountSummary } from "../responses/accountSummary";
import { SortDirection } from "../sortDirection";

type AccountSummaryKeys = keyof AccountSummary;

const sortColumns: AccountSummaryKeys[] = ["id", "username", "dateCreated"];

const [firstSortColumn, ...restSortColumns] = sortColumns;

export const getAccountsRequestSchema = z.object({
  page: z.coerce.number().nonnegative().default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(1000).default(10).optional(),
  sortBy: z.enum([firstSortColumn, ...restSortColumns]).optional(),
  sortDirection: z.nativeEnum(SortDirection).optional(),
});

export type GetAccountsRequest = z.infer<typeof getAccountsRequestSchema>;
