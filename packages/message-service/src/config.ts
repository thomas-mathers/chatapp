import { LogLevel } from 'chatapp.logging';
import dotenv from 'dotenv';
import z from 'zod';

export const configSchema = z
  .object({
    PORT: z.coerce.number(),
    JWT_ISSUER: z.string(),
    JWT_AUDIENCE: z.string(),
    JWT_SECRET: z.string(),
    JWT_EXPIRATION_TIME_IN_SECONDS: z.coerce.number(),
    MONGO_URI: z.string(),
    WEB_SOCKET_SERVER_PORT: z.coerce.number(),
    LOG_LEVEL: z.enum([
      'error',
      'warn',
      'info',
      'http',
      'verbose',
      'debug',
      'silly',
    ]),
  })
  .transform(
    ({
      PORT,
      JWT_ISSUER,
      JWT_AUDIENCE,
      JWT_SECRET,
      JWT_EXPIRATION_TIME_IN_SECONDS,
      MONGO_URI,
      WEB_SOCKET_SERVER_PORT,
      LOG_LEVEL,
    }) => ({
      port: PORT,
      jwt: {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        secret: JWT_SECRET,
        expirationTimeInSeconds: JWT_EXPIRATION_TIME_IN_SECONDS,
      },
      mongo: {
        uri: MONGO_URI,
      },
      wss: {
        port: WEB_SOCKET_SERVER_PORT,
      },
      logging: {
        level: LOG_LEVEL as LogLevel,
      },
    }),
  );

export type Config = z.infer<typeof configSchema>;

export function parseConfigFromFile(path: string): Config {
  const { parsed } = dotenv.config({ path });

  return configSchema.parse(parsed);
}
