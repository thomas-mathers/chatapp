import { LogLevel } from 'chatapp.logging';
import dotenv from 'dotenv';
import z from 'zod';

export const configSchema = z
  .object({
    PORT: z.coerce.number(),
    LOG_LEVEL: z.enum([
      'error',
      'warn',
      'info',
      'http',
      'verbose',
      'debug',
      'silly',
    ]),
    BASE_PATH: z.string(),
    MAX_FILE_SIZE: z.coerce.number(),
    MIME_TYPES: z.string().transform((value) => value.split(',')),
  })
  .transform(({ PORT, LOG_LEVEL, BASE_PATH, MAX_FILE_SIZE, MIME_TYPES }) => ({
    port: PORT,
    logging: {
      level: LOG_LEVEL as LogLevel,
    },
    basePath: BASE_PATH,
    maxFileSize: MAX_FILE_SIZE,
    mimeTypes: new Set<string>(MIME_TYPES),
  }));

export type Config = z.infer<typeof configSchema>;

export function getConfig(env: string = process.env.NODE_ENV ?? ''): Config {
  const { parsed } = dotenv.config({ path: `${env}.env` });

  return configSchema.parse(parsed);
}
