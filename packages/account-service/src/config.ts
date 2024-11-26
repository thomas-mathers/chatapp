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
    RABBIT_MQ_URL: z.string(),
    RABBIT_MQ_EXCHANGE_NAME: z.string(),
    REDIS_URL: z.string(),
    LOG_LEVEL: z.enum([
      'error',
      'warn',
      'info',
      'http',
      'verbose',
      'debug',
      'silly',
    ]),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    FACEBOOK_CLIENT_ID: z.string(),
    FACEBOOK_CLIENT_SECRET: z.string(),
    FRONT_END_URL: z.string(),
    FILE_STORAGE_SERVICE_URL: z.string(),
    FILE_STORAGE_SERVICE_MAX_FILE_SIZE: z.coerce.number(),
    API_KEY: z.string(),
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
      RABBIT_MQ_URL,
      RABBIT_MQ_EXCHANGE_NAME,
      REDIS_URL,
      LOG_LEVEL,
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      FACEBOOK_CLIENT_ID,
      FACEBOOK_CLIENT_SECRET,
      FRONT_END_URL,
      FILE_STORAGE_SERVICE_URL,
      FILE_STORAGE_SERVICE_MAX_FILE_SIZE,
      API_KEY,
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
      rabbitMq: {
        url: RABBIT_MQ_URL,
        exchangeName: RABBIT_MQ_EXCHANGE_NAME,
      },
      redis: {
        url: REDIS_URL,
      },
      logging: {
        level: LOG_LEVEL as LogLevel,
      },
      google: {
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
      },
      facebook: {
        clientId: FACEBOOK_CLIENT_ID,
        clientSecret: FACEBOOK_CLIENT_SECRET,
      },
      frontEndUrl: FRONT_END_URL,
      fileStorageService: {
        url: FILE_STORAGE_SERVICE_URL,
        maxFileSize: FILE_STORAGE_SERVICE_MAX_FILE_SIZE,
      },
      apiKey: API_KEY,
    }),
  );

export type Config = z.infer<typeof configSchema>;

export function getConfig(): Config {
  return configSchema.parse(process.env);
}
