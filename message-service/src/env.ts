import dotenv from 'dotenv';
import z from 'zod';

dotenv.config();

const schema = z.object({
  PORT: z.coerce.number(),
  JWT_ISSUER: z.string(),
  JWT_AUDIENCE: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRATION_TIME_IN_SECONDS: z.coerce.number(),
  MESSAGE_SERVICE_MONGO_URI: z.string(),
});

const env = schema.parse(process.env);

export default env;
