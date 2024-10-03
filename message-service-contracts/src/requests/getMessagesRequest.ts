import { z } from "zod";

export const getMessagesRequestSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
  sortBy: z.string().min(1).default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

export type GetMessagesRequest = z.infer<typeof getMessagesRequestSchema>;
