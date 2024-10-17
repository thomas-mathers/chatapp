import { z } from 'zod';

export const configSchema = z.object({
  VITE_ACCOUNT_SERVICE_BASE_URL: z.string(),
  VITE_AUTH_SERVICE_BASE_URL: z.string(),
  VITE_REALTIME_MESSAGE_SERVICE_BASE_URL: z.string(),
  VITE_MESSAGE_SERVICE_BASE_URL: z.string(),
});

export type Config = z.infer<typeof configSchema>;

export function getConfig(): Config {
  return configSchema.parse(import.meta.env);
}
