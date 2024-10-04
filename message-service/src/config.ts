import { JwtOptions } from 'chatapp.middlewares';
import dotenv from 'dotenv';
import z from 'zod';

interface Config {
  port: number;
  jwt: JwtOptions;
  mongoUri: string;
}

dotenv.config();

const schema = z.object({
  PORT: z.coerce.number(),
  JWT_ISSUER: z.string(),
  JWT_AUDIENCE: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRATION_TIME_IN_SECONDS: z.coerce.number(),
  MONGO_URI: z.string(),
});

const env = schema.parse(process.env);

const config: Config = {
  port: env.PORT,
  jwt: {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    secret: env.JWT_SECRET,
    maxAgeInSeconds: env.JWT_EXPIRATION_TIME_IN_SECONDS,
  },
  mongoUri: env.MONGO_URI,
};

export default config;
