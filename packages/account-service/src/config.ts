import { LogLevel } from 'chatapp.logging';
import z from 'zod';

export const configSchema = z
  .object({
    ACCOUNT_SERVICE_PORT: z.coerce.number(),
    ACCOUNT_SERVICE_JWT_ISSUER: z.string(),
    ACCOUNT_SERVICE_JWT_AUDIENCE: z.string(),
    ACCOUNT_SERVICE_JWT_SECRET: z.string(),
    ACCOUNT_SERVICE_JWT_EXPIRATION_TIME_IN_SECONDS: z.coerce.number(),
    ACCOUNT_SERVICE_MONGO_URI: z.string(),
    ACCOUNT_SERVICE_MONGO_DATABASE_NAME: z.string().optional(),
    ACCOUNT_SERVICE_RABBIT_MQ_URL: z.string(),
    ACCOUNT_SERVICE_RABBIT_MQ_EXCHANGE_NAME: z.string(),
    ACCOUNT_SERVICE_REDIS_URL: z.string(),
    ACCOUNT_SERVICE_LOG_LEVEL: z.enum([
      'error',
      'warn',
      'info',
      'http',
      'verbose',
      'debug',
      'silly',
    ]),
    ACCOUNT_SERVICE_GOOGLE_CLIENT_ID: z.string(),
    ACCOUNT_SERVICE_GOOGLE_CLIENT_SECRET: z.string(),
    ACCOUNT_SERVICE_FACEBOOK_CLIENT_ID: z.string(),
    ACCOUNT_SERVICE_FACEBOOK_CLIENT_SECRET: z.string(),
    ACCOUNT_SERVICE_FRONT_END_URL: z.string(),
    ACCOUNT_SERVICE_FILE_STORAGE_SERVICE_URL: z.string(),
    ACCOUNT_SERVICE_FILE_STORAGE_SERVICE_MAX_FILE_SIZE: z.coerce.number(),
    ACCOUNT_SERVICE_API_KEY: z.string(),
  })
  .transform(
    ({
      ACCOUNT_SERVICE_PORT,
      ACCOUNT_SERVICE_JWT_ISSUER,
      ACCOUNT_SERVICE_JWT_AUDIENCE,
      ACCOUNT_SERVICE_JWT_SECRET,
      ACCOUNT_SERVICE_JWT_EXPIRATION_TIME_IN_SECONDS,
      ACCOUNT_SERVICE_MONGO_URI,
      ACCOUNT_SERVICE_MONGO_DATABASE_NAME,
      ACCOUNT_SERVICE_RABBIT_MQ_URL,
      ACCOUNT_SERVICE_RABBIT_MQ_EXCHANGE_NAME,
      ACCOUNT_SERVICE_REDIS_URL,
      ACCOUNT_SERVICE_LOG_LEVEL,
      ACCOUNT_SERVICE_GOOGLE_CLIENT_ID,
      ACCOUNT_SERVICE_GOOGLE_CLIENT_SECRET,
      ACCOUNT_SERVICE_FACEBOOK_CLIENT_ID,
      ACCOUNT_SERVICE_FACEBOOK_CLIENT_SECRET,
      ACCOUNT_SERVICE_FRONT_END_URL,
      ACCOUNT_SERVICE_FILE_STORAGE_SERVICE_URL,
      ACCOUNT_SERVICE_FILE_STORAGE_SERVICE_MAX_FILE_SIZE,
      ACCOUNT_SERVICE_API_KEY,
    }) => ({
      port: ACCOUNT_SERVICE_PORT,
      jwt: {
        issuer: ACCOUNT_SERVICE_JWT_ISSUER,
        audience: ACCOUNT_SERVICE_JWT_AUDIENCE,
        secret: ACCOUNT_SERVICE_JWT_SECRET,
        expirationTimeInSeconds: ACCOUNT_SERVICE_JWT_EXPIRATION_TIME_IN_SECONDS,
      },
      mongo: {
        uri: ACCOUNT_SERVICE_MONGO_URI,
        databaseName: ACCOUNT_SERVICE_MONGO_DATABASE_NAME,
      },
      rabbitMq: {
        url: ACCOUNT_SERVICE_RABBIT_MQ_URL,
        exchangeName: ACCOUNT_SERVICE_RABBIT_MQ_EXCHANGE_NAME,
      },
      redis: {
        url: ACCOUNT_SERVICE_REDIS_URL,
      },
      logging: {
        level: ACCOUNT_SERVICE_LOG_LEVEL as LogLevel,
      },
      google: {
        clientId: ACCOUNT_SERVICE_GOOGLE_CLIENT_ID,
        clientSecret: ACCOUNT_SERVICE_GOOGLE_CLIENT_SECRET,
      },
      facebook: {
        clientId: ACCOUNT_SERVICE_FACEBOOK_CLIENT_ID,
        clientSecret: ACCOUNT_SERVICE_FACEBOOK_CLIENT_SECRET,
      },
      frontEndUrl: ACCOUNT_SERVICE_FRONT_END_URL,
      fileStorageService: {
        url: ACCOUNT_SERVICE_FILE_STORAGE_SERVICE_URL,
        maxFileSize: ACCOUNT_SERVICE_FILE_STORAGE_SERVICE_MAX_FILE_SIZE,
      },
      apiKey: ACCOUNT_SERVICE_API_KEY,
    }),
  );

export type Config = z.infer<typeof configSchema>;

export function getConfig(): Config {
  return configSchema.parse(process.env);
}
