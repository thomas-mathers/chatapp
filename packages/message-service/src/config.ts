import { LogLevel } from 'chatapp.logging';
import z from 'zod';

export const configSchema = z
  .object({
    PORT: z.coerce.number(),
    JWT_ISSUER: z.string(),
    JWT_AUDIENCE: z.string(),
    JWT_SECRET: z.string(),
    JWT_EXPIRATION_TIME_IN_SECONDS: z.coerce.number(),
    MONGO_URI: z.string(),
    MONGO_DATABASE_NAME: z.string().optional(),
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
    ACCOUNT_SERVICE_URL: z.string(),
    ACCOUNT_SERVICE_API_KEY: z.string(),
  })
  .transform(
    ({
      PORT,
      JWT_ISSUER,
      JWT_AUDIENCE,
      JWT_SECRET,
      JWT_EXPIRATION_TIME_IN_SECONDS,
      MONGO_URI,
      MONGO_DATABASE_NAME,
      WEB_SOCKET_SERVER_PORT,
      LOG_LEVEL,
      ACCOUNT_SERVICE_URL,
      ACCOUNT_SERVICE_API_KEY,
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
        databaseName: MONGO_DATABASE_NAME,
      },
      wss: {
        port: WEB_SOCKET_SERVER_PORT,
      },
      logging: {
        level: LOG_LEVEL as LogLevel,
      },
      accountService: {
        url: ACCOUNT_SERVICE_URL,
        apiKey: ACCOUNT_SERVICE_API_KEY,
      },
    }),
  );

export type Config = z.infer<typeof configSchema>;

export function getConfig(): Config {
  return configSchema.parse(process.env);
}
