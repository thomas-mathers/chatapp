import dotenv from 'dotenv';
import z from 'zod';

dotenv.config();

const schema = z
  .object({
    PORT: z.coerce.number(),
    JWT_ISSUER: z.string(),
    JWT_AUDIENCE: z.string(),
    JWT_SECRET: z.string(),
    JWT_EXPIRATION_TIME_IN_SECONDS: z.coerce.number(),
    MONGO_URI: z.string(),
  })
  .transform((obj) => ({
    port: obj.PORT,
    jwt: {
      issuer: obj.JWT_ISSUER,
      audience: obj.JWT_AUDIENCE,
      secret: obj.JWT_SECRET,
      maxAgeInSeconds: obj.JWT_EXPIRATION_TIME_IN_SECONDS,
    },
    mongoUri: obj.MONGO_URI,
  }));

const config = schema.parse(process.env);

export default config;
