import z from 'zod';

export const configSchema = z.object({
  RESEND_API_KEY: z.string(),
  RABBIT_MQ_URL: z.string(),
  RABBIT_MQ_EXCHANGE_NAME: z.string(),
  ADMIN_EMAIL: z.string(),
  SPA_URL: z.string(),
});

export type Config = z.infer<typeof configSchema>;

export function getConfig(): Config {
  return configSchema.parse(process.env);
}
