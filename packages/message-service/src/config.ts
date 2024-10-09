import z from 'zod';

export const configSchema = z
  .object({
    PORT: z.coerce.number(),
    JWT_ISSUER: z.string(),
    JWT_AUDIENCE: z.string(),
    JWT_SECRET: z.string(),
    JWT_EXPIRATION_TIME_IN_SECONDS: z.coerce.number(),
    MONGO_URI: z.string(),
  })
  .transform(
    ({
      PORT,
      JWT_ISSUER,
      JWT_AUDIENCE,
      JWT_SECRET,
      JWT_EXPIRATION_TIME_IN_SECONDS,
      MONGO_URI,
    }) => ({
      port: PORT,
      jwt: {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        secret: JWT_SECRET,
        expirationTimeInSeconds: JWT_EXPIRATION_TIME_IN_SECONDS,
      },
      mongoUri: MONGO_URI,
    }),
  );

export type Config = z.infer<typeof configSchema>;
