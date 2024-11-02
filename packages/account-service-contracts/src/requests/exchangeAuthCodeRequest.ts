import { z } from 'zod';

export const exchangeAuthCodeRequestSchema = z.object({
  code: z.string().min(1),
});

export type ExchangeAuthCodeRequest = z.infer<
  typeof exchangeAuthCodeRequestSchema
>;
