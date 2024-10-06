import z from "zod";

export const configSchema = z.object({
  RESEND_API_KEY: z.string(),
  RABBIT_MQ_URL: z.string(),
  RABBIT_MQ_EXCHANGE_NAME: z.string(),
});

export type Config = z.infer<typeof configSchema>;
