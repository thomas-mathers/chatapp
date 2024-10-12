import dotenv from 'dotenv';
import z from 'zod';

export const configSchema = z.object({
  RESEND_API_KEY: z.string(),
  RABBIT_MQ_URL: z.string(),
  RABBIT_MQ_EXCHANGE_NAME: z.string(),
  ADMIN_EMAIL: z.string(),
});

export type Config = z.infer<typeof configSchema>;

export function getConfig(env: string = process.env.NODE_ENV ?? ''): Config {
  const { parsed } = dotenv.config({ path: `${env}.env` });

  return configSchema.parse(parsed);
}
