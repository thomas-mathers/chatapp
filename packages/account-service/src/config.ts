import z from 'zod';

export const configSchema = z
  .object({
    PORT: z.coerce.number(),
    JWT_ISSUER: z.string(),
    JWT_AUDIENCE: z.string(),
    JWT_SECRET: z.string(),
    JWT_EXPIRATION_TIME_IN_SECONDS: z.coerce.number(),
    MONGO_URI: z.string(),
    RABBIT_MQ_URL: z.string(),
    RABBIT_MQ_EXCHANGE_NAME: z.string(),
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
      RABBIT_MQ_URL,
      RABBIT_MQ_EXCHANGE_NAME,
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
      rabbitMq: {
        url: RABBIT_MQ_URL,
        exchangeName: RABBIT_MQ_EXCHANGE_NAME,
      },
      logging: {
        level: LOG_LEVEL,
      },
    }),
  );

export type Config = z.infer<typeof configSchema>;
