import { LogLevel } from 'chatapp.logging';
import z from 'zod';

export const configSchema = z
  .object({
    MESSAGE_SERVICE_PORT: z.coerce.number(),
    MESSAGE_SERVICE_JWT_ISSUER: z.string(),
    MESSAGE_SERVICE_JWT_AUDIENCE: z.string(),
    MESSAGE_SERVICE_JWT_SECRET: z.string(),
    MESSAGE_SERVICE_JWT_EXPIRATION_TIME_IN_SECONDS: z.coerce.number(),
    MESSAGE_SERVICE_MONGO_URI: z.string(),
    MESSAGE_SERVICE_MONGO_DATABASE_NAME: z.string().optional(),
    MESSAGE_SERVICE_WEB_SOCKET_SERVER_PORT: z.coerce.number(),
    MESSAGE_SERVICE_LOG_LEVEL: z.enum([
      'error',
      'warn',
      'info',
      'http',
      'verbose',
      'debug',
      'silly',
    ]),
    MESSAGE_SERVICE_ACCOUNT_SERVICE_URL: z.string(),
    MESSAGE_SERVICE_ACCOUNT_SERVICE_API_KEY: z.string(),
  })
  .transform(
    ({
      MESSAGE_SERVICE_PORT,
      MESSAGE_SERVICE_JWT_ISSUER,
      MESSAGE_SERVICE_JWT_AUDIENCE,
      MESSAGE_SERVICE_JWT_SECRET,
      MESSAGE_SERVICE_JWT_EXPIRATION_TIME_IN_SECONDS,
      MESSAGE_SERVICE_MONGO_URI,
      MESSAGE_SERVICE_MONGO_DATABASE_NAME,
      MESSAGE_SERVICE_WEB_SOCKET_SERVER_PORT,
      MESSAGE_SERVICE_LOG_LEVEL,
      MESSAGE_SERVICE_ACCOUNT_SERVICE_URL,
      MESSAGE_SERVICE_ACCOUNT_SERVICE_API_KEY,
    }) => ({
      port: MESSAGE_SERVICE_PORT,
      jwt: {
        issuer: MESSAGE_SERVICE_JWT_ISSUER,
        audience: MESSAGE_SERVICE_JWT_AUDIENCE,
        secret: MESSAGE_SERVICE_JWT_SECRET,
        expirationTimeInSeconds: MESSAGE_SERVICE_JWT_EXPIRATION_TIME_IN_SECONDS,
      },
      mongo: {
        uri: MESSAGE_SERVICE_MONGO_URI,
        databaseName: MESSAGE_SERVICE_MONGO_DATABASE_NAME,
      },
      wss: {
        port: MESSAGE_SERVICE_WEB_SOCKET_SERVER_PORT,
      },
      logging: {
        level: MESSAGE_SERVICE_LOG_LEVEL as LogLevel,
      },
      accountService: {
        url: MESSAGE_SERVICE_ACCOUNT_SERVICE_URL,
        apiKey: MESSAGE_SERVICE_ACCOUNT_SERVICE_API_KEY,
      },
    }),
  );

export type Config = z.infer<typeof configSchema>;

export function getConfig(): Config {
  return configSchema.parse(process.env);
}
